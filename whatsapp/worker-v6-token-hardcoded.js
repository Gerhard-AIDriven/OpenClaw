/**
 * AI Driven Property Due Diligence Worker - Version 6 (Token Hardcoded)
 * 
 * Hardcoded POLL_API_TOKEN to avoid environment variable deployment issues.
 * Deploy this to: aidriven-whatsapp-webhook.gerhard-8a6.workers.dev
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    console.log(`📨 Request: ${request.method} ${path}`);

    try {
      if (path === '/queue-manual' && request.method === 'POST') {
        return await handleManualQueue(request, env);
      }

      if (path === '/poll' && request.method === 'GET') {
        return await handlePoll(request, env);
      }

      if (path === '/generate-report' && request.method === 'POST') {
        return await handleGenerateReport(request, env);
      }

      if (path === '/complete' && request.method === 'POST') {
        return await handleComplete(request, env);
      }

      // Health check
      if (path === '/health') {
        return new Response(JSON.stringify({
          status: 'ok',
          timestamp: new Date().toISOString(),
          worker: 'aidriven-whatsapp-webhook-v6'
        }), {
          headers: { 'Content-Type': 'application/json' }
        });
      }

      return new Response('Not Found', { status: 404 });

    } catch (error) {
      console.error('❌ Global error:', error);
      return new Response(JSON.stringify({
        success: false,
        error: error.message
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
};

// ============================================
// MANUAL QUEUE HANDLER
// ============================================

/**
 * Check if address is in Napier and has a valid RID
 * Returns: { isNapier: boolean, hasRID: boolean, rid: string|null }
 */
async function checkNapierAddress(address) {
  try {
    // Simple Napier detection
    const napierKeywords = ['napier', 'taradale', 'greenmeadows', 'westshore', 'marewa', 'poraiti'];
    const isNapier = napierKeywords.some(keyword => address.toLowerCase().includes(keyword));
    
    if (!isNapier) {
      return { isNapier: false, hasRID: false, rid: null };
    }
    
    // Try to resolve address via NCC API
    const url = `https://data.napier.govt.nz/regional/ncc/property_find.php?search=${encodeURIComponent(address)}&type=address`;
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      cf: { cacheTtl: 60 } // Cache for 1 minute
    });
    
    if (!response.ok) {
      console.log(`⚠️ NCC API returned ${response.status} for: ${address}`);
      return { isNapier: true, hasRID: false, rid: null };
    }
    
    const results = await response.json();
    
    if (!results || results.length === 0) {
      console.log(`ℹ️ No RID found for Napier address: ${address}`);
      return { isNapier: true, hasRID: false, rid: null };
    }
    
    const bestMatch = results[0];
    console.log(`✅ Found RID ${bestMatch.id} for: ${bestMatch.value}`);
    return { isNapier: true, hasRID: true, rid: bestMatch.id };
    
  } catch (error) {
    console.error(`❌ Error checking Napier address: ${error.message}`);
    return { isNapier: false, hasRID: false, rid: null };
  }
}

async function handleManualQueue(request, env) {
  try {
    const body = await request.json();
    const { requestId, customer, address, addressStructured, package: pkg, addons, requiresManualProcessing, notes } = body;

    if (!requestId || !customer || !address) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing required fields: requestId, customer, address'
      }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    // Build address for LINZ API - prefer structured fields if available
    let linzAddress = address;
    if (addressStructured && addressStructured.houseNumber && addressStructured.streetName) {
      // Construct clean address from structured parts
      const streetFull = [addressStructured.houseNumber, addressStructured.streetName, addressStructured.streetType].filter(p => p).join(' ');
      const parts = [streetFull, addressStructured.suburb, addressStructured.city, addressStructured.postcode].filter(p => p);
      linzAddress = parts.join(', ');
      console.log('🏗️  Built LINZ address from structured:', linzAddress);
    }

    // Determine if this can be automated or needs manual processing
    let requiresManual = false;
    let automationNotes = '';
    
    // Check if rates/council addon is requested
    const hasRatesAddon = addons && (addons.rates || addons['council-fees'] || addons['rates-information']);
    
    if (hasRatesAddon) {
      // Check if Napier address with valid RID
      const napierCheck = await checkNapierAddress(linzAddress);
      
      if (!napierCheck.isNapier) {
        requiresManual = true;
        automationNotes = `Non-Napier property (${linzAddress}) - manual council research required`;
        console.log(`ℹ️ ${automationNotes}`);
      } else if (!napierCheck.hasRID) {
        requiresManual = true;
        automationNotes = `Napier address not found in MyProperty system - manual lookup required`;
        console.log(`⚠️ ${automationNotes}`);
      } else {
        automationNotes = `Napier property with RID ${napierCheck.rid} - automated rates fetch possible`;
        console.log(`✅ ${automationNotes}`);
      }
    }
    
    const manualRequest = {
      id: requestId,
      source: 'google-form',
      customer,
      address: linzAddress,
      addressStructured: addressStructured || null,
      package: pkg || 'basic',
      addons: addons || {},
      requiresManualProcessing: requiresManual,
      automationNotes: automationNotes,
      napierRID: hasRatesAddon && automationNotes.includes('automated') ? 
        (await checkNapierAddress(linzAddress)).rid : null,
      notes: notes || '',
      submittedAt: new Date().toISOString()
    };

    // Store in KV with appropriate prefix
    const prefix = manualRequest.requiresManualProcessing ? 'manual:' : 'automated:';
    const kvKey = `${prefix}${requestId}`;
    
    if (!env.REPORT_QUEUE_KV) {
      return new Response(JSON.stringify({
        success: false,
        error: 'KV store not configured'
      }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    await env.REPORT_QUEUE_KV.put(kvKey, JSON.stringify(manualRequest));
    console.log(`✅ Stored request ${kvKey} in KV`);

    // ALWAYS send customer confirmation email
    const customerSubject = `🏠 Property Due Diligence Request Received - ${address}`;
    const customerBody = generateCustomerConfirmationEmail(customer, address, pkg, addons, requiresManual, automationNotes);
    
    try {
      await sendEmail(customer.email, customerSubject, customerBody, env);
      console.log(`✅ Customer confirmation email sent to ${customer.email}`);
    } catch (emailError) {
      console.error(`⚠️ Failed to send customer email: ${emailError.message}`);
    }

    // ONLY send Gerhard notification if manual processing is required
    if (requiresManual) {
      const gerhardSubject = `⚠️ Manual Processing Required: ${address}`;
      const gerhardBody = generateGerhardNotificationEmail(manualRequest);
      
      try {
        const gerhardEmail = env.GERHARD_EMAIL || 'gstimie@gmail.com';
        await sendEmail(gerhardEmail, gerhardSubject, gerhardBody, env);
        console.log(`✅ Gerhard notification sent to ${gerhardEmail}`);
      } catch (emailError) {
        console.error(`⚠️ Failed to send Gerhard notification: ${emailError.message}`);
      }
    } else {
      console.log(`ℹ️ Automated request - no Gerhard notification needed (${automationNotes})`);
    }

    return new Response(JSON.stringify({
      success: true,
      requestId,
      storedIn: prefix,
      customerEmailSent: true,
      gerhardNotificationSent: manualRequest.requiresManualProcessing
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Error in handleManualQueue:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// ============================================
// POLL HANDLER (For OpenClaw Cron Job)
// ============================================

async function handlePoll(request, env) {
  const url = new URL(request.url);
  const token = url.searchParams.get('token');

  // Hardcoded token - no environment variable needed
  const EXPECTED_TOKEN = 'aidriven_poll_secret_2026_xK9mP';
  
  if (token !== EXPECTED_TOKEN) {
    console.log(`❌ Invalid token provided: ${token}`);
    return new Response(JSON.stringify({
      success: false,
      error: 'Unauthorized'
    }), { status: 401, headers: { 'Content-Type': 'application/json' } });
  }

  try {
    if (!env.REPORT_QUEUE_KV) {
      return new Response(JSON.stringify({
        success: false,
        error: 'KV store not configured'
      }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    // Fetch automated requests only (for OpenClaw cron job)
    const autoKeys = await env.REPORT_QUEUE_KV.list({ prefix: 'automated:' });
    const automatedRequests = [];

    for (const key of autoKeys.keys) {
      const value = await env.REPORT_QUEUE_KV.get(key.name);
      if (value) {
        automatedRequests.push(JSON.parse(value));
      }
    }

    console.log(`📋 Poll returned ${automatedRequests.length} automated request(s)`);

    return new Response(JSON.stringify({
      success: true,
      count: automatedRequests.length,
      requests: automatedRequests
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Error in handlePoll:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// ============================================
// GENERATE REPORT HANDLER (Placeholder)
// ============================================

async function handleGenerateReport(request, env) {
  try {
    const body = await request.json();
    const { requestId, address, customer } = body;

    if (!requestId || !address) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing required fields: requestId, address'
      }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    console.log(`📝 Generating report for ${requestId}: ${address}`);

    // Placeholder - actual report generation happens in OpenClaw
    return new Response(JSON.stringify({
      success: true,
      message: 'Report generation initiated',
      requestId,
      status: 'pending'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Error in handleGenerateReport:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// ============================================
// COMPLETE HANDLER (Mark Request as Done)
// ============================================

async function handleComplete(request, env) {
  const url = new URL(request.url);
  const token = url.searchParams.get('token');
  const id = url.searchParams.get('id');

  // Hardcoded token
  const EXPECTED_TOKEN = 'aidriven_poll_secret_2026_xK9mP';
  
  if (token !== EXPECTED_TOKEN) {
    return new Response(JSON.stringify({
      success: false,
      error: 'Unauthorized'
    }), { status: 401, headers: { 'Content-Type': 'application/json' } });
  }

  if (!id) {
    return new Response(JSON.stringify({
      success: false,
      error: 'Missing request ID'
    }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  try {
    if (!env.REPORT_QUEUE_KV) {
      return new Response(JSON.stringify({
        success: false,
        error: 'KV store not configured'
      }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    // Try both prefixes
    let deleted = false;
    for (const prefix of ['automated:', 'manual:']) {
      const key = `${prefix}${id}`;
      const existing = await env.REPORT_QUEUE_KV.get(key);
      if (existing) {
        await env.REPORT_QUEUE_KV.delete(key);
        console.log(`✅ Deleted completed request: ${key}`);
        deleted = true;
        break;
      }
    }

    if (!deleted) {
      console.log(`⚠️ Request not found: ${id}`);
      return new Response(JSON.stringify({
        success: false,
        error: 'Request not found'
      }), { status: 404, headers: { 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Request marked as complete',
      id
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Error in handleComplete:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// ============================================
// EMAIL SENDING FUNCTION (Mailgun API)
// ============================================

async function sendEmail(to, subject, body, env) {
  const domain = env.MAILGUN_DOMAIN || 'mg.aidriven.biz';
  // Hardcoded Mailgun API key
  const apiKey = '46490b2301ebf73fa76a2d5c29b60930-6648d8d0-96b41ae8';
  const fromEmail = env.MAILGUN_FROM_EMAIL || `gerhard@${domain}`;

  if (!apiKey) {
    throw new Error('Mailgun API key not configured');
  }

  const params = new URLSearchParams();
  params.append('from', `Gerhard (AI Driven) <${fromEmail}>`);
  params.append('to', to);
  params.append('subject', subject);
  params.append('text', body);

  // Set Reply-To to Gerhard's email so customers can reply directly
  if (env.GERHARD_EMAIL) {
    params.append('h:Reply-To', env.GERHARD_EMAIL);
  }

  try {
    const credentials = btoa(`api:${apiKey}`);
    
    const response = await fetch(`https://api.mailgun.net/v3/${domain}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + credentials,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Mailgun API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log(`✅ Email sent to ${to}: ${result.id}`);
    return { success: true, id: result.id };

  } catch (error) {
    console.error(`❌ Failed to send email to ${to}: ${error.message}`);
    throw error;
  }
}

// ============================================
// EMAIL TEMPLATES
// ============================================

function generateCustomerConfirmationEmail(customer, address, pkg, addons, requiresManual) {
  let body = `Dear Valued Customer,\n\n`;
  body += `Thank you for your property due diligence request!\n\n`;
  body += `📍 Property: ${address}\n`;
  body += `📦 Package: ${pkg}\n`;
  
  if (addons && Object.keys(addons).length > 0) {
    body += `📎 Add-ons: ${Object.keys(addons).join(', ')}\n`;
  }
  
  body += `\n`;
  
  if (requiresManual) {
    // Custom message based on why it needs manual work
    if (automationNotes && automationNotes.includes('Non-Napier')) {
      body += `Your request includes council rates information for a property outside Napier City.\n`;
      body += `Gerhard will manually research this from the relevant council and send your report within 24-48 hours.\n\n`;
    } else if (automationNotes && automationNotes.includes('not found')) {
      body += `The property address provided could not be automatically located in the council system.\n`;
      body += `Gerhard will manually verify the address and send your report within 24-48 hours.\n\n`;
    } else {
      body += `Your request includes add-ons that require manual processing.\n`;
      body += `Gerhard will review your request and send the report within 24-48 hours.\n\n`;
    }
    body += `If you have urgent questions, reply to this email.\n`;
  } else {
    body += `✅ Your request is being processed automatically.\n`;
    body += `You will receive your comprehensive due diligence report shortly (typically within 5-10 minutes).\n\n`;
  }
  
  body += `Ngā mihi,\n`;
  body += `AI Driven Team\n`;
  body += `Practical AI for real businesses\n`;
  body += `www.aidriven.biz\n`;
  
  return body;
}

function generateGerhardNotificationEmail(request) {
  let body = `🔔 NEW MANUAL PROCESSING REQUEST\n\n`;
  body += `Customer: ${request.customer}\n`;
  body += `Property: ${request.address}\n`;
  body += `Package: ${request.package}\n`;
  body += `Submitted: ${request.submittedAt}\n\n`;
  
  if (request.addons && Object.keys(request.addons).length > 0) {
    body += `Add-ons requiring manual work:\n`;
    Object.keys(request.addons).forEach(key => {
      if (request.addons[key]) {
        body += `- ${key}\n`;
      }
    });
    body += `\n`;
  }
  
  if (request.notes) {
    body += `Customer notes: ${request.notes}\n\n`;
  }
  
  body += `ACTION REQUIRED:\n`;
  body += `1. Log into relevant council portals\n`;
  body += `2. Download rates/council fee information\n`;
  body += `3. Generate final report\n`;
  body += `4. Email report to customer\n`;
  body += `5. Mark request as complete via /complete endpoint\n\n`;
  
  body += `Request ID: ${request.id}\n`;
  
  return body;
}
