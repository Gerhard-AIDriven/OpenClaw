/**
 * AI Driven Property Due Diligence Worker - Version 5 (Mailgun Fixed) - CORRECTED
 * 
 * FIX APPLIED: Always send customer confirmation email, but only send Gerhard
 * the manual processing notification when actually required.
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
          worker: 'aidriven-whatsapp-webhook-v5'
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
// MANUAL QUEUE HANDLER (Email Notifications)
// ============================================

async function handleManualQueue(request, env) {
  try {
    const body = await request.json();
    const { requestId, customer, address, package: pkg, addons, requiresManualProcessing, notes } = body;

    if (!requestId || !customer || !address) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing required fields: requestId, customer, address'
      }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const manualRequest = {
      id: requestId,
      source: 'google-form',
      customer,
      address,
      package: pkg || 'basic',
      addons: addons || {},
      requiresManualProcessing: requiresManualProcessing === true,
      status: 'pending_manual',
      createdAt: new Date().toISOString(),
      notes
    };

    // Store in KV - separate queues for manual vs automated
    if (env.REPORT_QUEUE_KV) {
      const isManual = requiresManualProcessing === true;
      const queuePrefix = isManual ? 'manual' : 'automated';
      const status = isManual ? 'pending_manual' : 'pending_auto';
      
      await env.REPORT_QUEUE_KV.put(
        `${queuePrefix}:${requestId}`,
        JSON.stringify({
          ...manualRequest,
          status
        }),
        { expirationTtl: 7 * 24 * 60 * 60 }
      );

      console.log(`✅ Request queued: ${requestId} (${status})`);
      console.log(`   Requires Manual Processing: ${requiresManualProcessing}`);

      // Send email notifications via Mailgun
      const emailPromises = [];

      // 1. ALWAYS send acknowledgment email to customer (whether manual or automated)
      if (customer.email) {
        const isManual = requiresManualProcessing === true;
        const customerEmailPromise = sendEmail(
          customer.email,
          'AI Driven - Your Due Diligence Request Received',
          `
Hi ${customer.name || 'there'},

Thanks for your order! We've received your request for:

📍 Property: ${address}
📦 Package: ${pkg || 'basic'}
➕ Add-ons: ${addons?.ratesInfo ? 'Rates Information' : ''}${addons?.ratesInfo && addons?.councilFees ? ', ' : ''}${addons?.councilFees ? 'Council Fees' : ''}
${isManual ? '\n⏱️ Timeline: Since your request includes manual processing items, your complete report will be ready within 24-48 hours (not the standard 15-60 minutes).\n\nYou\'ll receive your report via email and WhatsApp once it\'s ready.' : '\n⏱️ Timeline: Your automated report will be generated within 15-60 minutes.\n\nYou\'ll receive your report via email and WhatsApp once it\'s ready.'}

Questions? Reply to this email!

AI Driven Team
🌐 aidriven.biz
          `.trim(),
          env
        );
        emailPromises.push(customerEmailPromise);
      }

      // 2. ONLY send notification to Gerhard if manual processing is required
      if (requiresManualProcessing === true) {
        const gerhardEmail = env.GERHARD_EMAIL || 'gerhard@aidriven.biz';
        const gerhardEmailPromise = sendEmail(
          gerhardEmail,
          `🔔 MANUAL PROCESSING REQUIRED - ${requestId}`,
          `
New manual processing request received:

📋 Request ID: ${requestId}
👤 Customer: ${customer.name || 'N/A'}
📧 Email: ${customer.email || 'N/A'}
📞 Phone: ${customer.phone || 'N/A'}
📍 Address: ${address}
📦 Package: ${pkg || 'basic'}
➕ Add-ons: ${addons?.ratesInfo ? 'Rates Information' : ''}${addons?.ratesInfo && addons?.councilFees ? ', ' : ''}${addons?.councilFees ? 'Council Fees' : ''}

Action required: Process manually within 24-48 hours.

Check the Google Sheet for full details:
https://docs.google.com/spreadsheets/d/10kokPSE-FkLh7n-ahlUZc0WG_jBFcmWA32F5UYv8kcI/edit

AI Driven System
          `.trim(),
          env
        );
        emailPromises.push(gerhardEmailPromise);
      } else {
        console.log('ℹ️ Automated request - no notification to Gerhard needed');
      }

      // Wait for all emails to send
      const results = await Promise.allSettled(emailPromises);

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          console.log(`✅ Email ${index + 1} sent successfully: ${result.value.id}`);
        } else {
          console.error(`❌ Email ${index + 1} failed: ${result.reason.message}`);
        }
      });

      return new Response(JSON.stringify({
        success: true,
        requestId,
        status: requiresManualProcessing === true ? 'queued_for_manual_processing' : 'queued_for_auto_processing',
        emailsSent: results.filter(r => r.status === 'fulfilled').length,
        errors: results.filter(r => r.status === 'rejected').map(r => r.reason.message)
      }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({
      success: false,
      error: 'KV store not available'
    }), { status: 500, headers: { 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('❌ Manual queue error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

// ============================================
// EMAIL SENDING FUNCTION (Mailgun API)
// ============================================

async function sendEmail(to, subject, body, env) {
  const domain = env.MAILGUN_DOMAIN || 'mg.aidriven.biz';
  const apiKey = '46490b2301ebf73fa76a2d5c29b60930-6648d8d0-96b41ae8';
  const fromEmail = env.MAILGUN_FROM_EMAIL || `gerhard@${domain}`;

  if (!apiKey) {
    throw new Error('MAILGUN_API_KEY not configured in environment variables');
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
    
    console.log('🔍 DEBUG - MAILGUN_DOMAIN:', domain);
    console.log('🔍 DEBUG - API_KEY length:', apiKey ? apiKey.length : 'MISSING');
    
    const response = await fetch(`https://api.mailgun.net/v3/${domain}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + credentials,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    });

    console.log('📧 Mailgun response status:', response.status);

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
// POLL HANDLER (For OpenClaw Cron Job)
// ============================================

async function handlePoll(request, env) {
  const url = new URL(request.url);
  const token = url.searchParams.get('token');

  if (token !== env.POLL_API_TOKEN) {
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

    // Fetch automated requests (for OpenClaw cron job)
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
    console.error('❌ Poll error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

// ============================================
// GENERATE REPORT HANDLER (Automated Reports)
// ============================================

async function handleGenerateReport(request, env) {
  try {
    const body = await request.json();
    const { address, package: pkg, customerId } = body;

    if (!address) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Address is required'
      }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    console.log(`📊 Generating report for: ${address}`);

    return new Response(JSON.stringify({
      success: true,
      message: 'Report generation started',
      estimatedTime: '15-60 minutes'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Generate report error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

// ============================================
// COMPLETE HANDLER (Mark Request as Done)
// ============================================

async function handleComplete(request, env) {
  const url = new URL(request.url);
  const token = url.searchParams.get('token');
  const id = url.searchParams.get('id');

  if (token !== env.POLL_API_TOKEN) {
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
        error: 'KV store not available'
      }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    // Delete from automated queue (move to completed/history if needed)
    await env.REPORT_QUEUE_KV.delete(`automated:${id}`);
    
    console.log(`✅ Marked request ${id} as completed`);

    return new Response(JSON.stringify({
      success: true,
      message: `Request ${id} marked as completed`
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error(`❌ Failed to complete request ${id}:`, error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
