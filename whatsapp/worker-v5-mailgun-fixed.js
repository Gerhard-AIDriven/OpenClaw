/**
 * AI Driven Property Due Diligence Worker - Version 5 (Mailgun Fixed)
 * Handles automated reports + manual processing queue (Rates/Council Fees)
 * Email notifications via Mailgun (FIXED: Correct Basic Auth header)
 * 
 * Deploy this to Cloudflare Worker: aidriven-whatsapp-webhook-v5
 * 
 * CHANGES IN V5:
 * - Fixed Authorization header: '***' → 'Basic ' (line 218)
 * - Ready for Mailgun API integration
 */

// ============================================
// MAIN REQUEST HANDLER
// ============================================

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
// MANUAL QUEUE HANDLER (Email Notifications Only)
// ============================================

async function handleManualQueue(request, env) {
  try {
    const body = await request.json();
    const { requestId, customer, address, package: pkg, addons, notes } = body;

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
      requiresManualProcessing: true,
      status: 'pending_manual',
      createdAt: new Date().toISOString(),
      notes
    };

    // Store in KV
    if (env.REPORT_QUEUE_KV) {
      await env.REPORT_QUEUE_KV.put(
        `manual:${requestId}`,
        JSON.stringify(manualRequest),
        { expirationTtl: 7 * 24 * 60 * 60 }
      );

      console.log(`✅ Manual request queued: ${requestId}`);

      // Send email notifications via Mailgun
      const emailPromises = [];

      // 1. Send acknowledgment email to customer
      if (customer.email) {
        const customerEmailPromise = sendEmail(
          customer.email,
          'AI Driven - Your Due Diligence Request Received',
          `
Hi ${customer.name || 'there'},

Thanks for your order! We've received your request for:

📍 Property: ${address}
📦 Package: ${pkg || 'basic'}
➕ Add-ons: ${addons?.ratesInfo ? 'Rates Information' : ''}${addons?.ratesInfo && addons?.councilFees ? ', ' : ''}${addons?.councilFees ? 'Council Fees' : ''}

⏱️ Timeline: Since your request includes manual processing items, your complete report will be ready within 24-48 hours (not the standard 15-60 minutes).

You'll receive your report via email and WhatsApp once it's ready.

Questions? Reply to this email!

AI Driven Team
🌐 aidriven.biz
          `.trim(),
          env
        );
        emailPromises.push(customerEmailPromise);
      }

      // 2. Send notification email to Gerhard
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
        status: 'queued_for_manual_processing',
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
  // Use hardcoded API key (matches working Python script and simple test worker)
  const apiKey = 'dea06fd768f566dfd3a35de38e3ddbb0-6648d8d0-c028d450';
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
    // Mailgun expects HTTP Basic Auth with 'api' as username and the exact API key as password
    // New Mailgun keys are raw hex strings (no 'key-' prefix) - use exactly as generated
    const credentials = btoa(`api:${apiKey}`);
    
    // DEBUG: Log what we're sending (check Cloudflare Logs)
    console.log('🔍 DEBUG - MAILGUN_DOMAIN:', domain);
    console.log('🔍 DEBUG - API_KEY length:', apiKey ? apiKey.length : 'MISSING');
    console.log('🔍 DEBUG - API_KEY first 8 chars:', apiKey ? apiKey.substring(0, 8) : 'N/A');
    console.log('🔍 DEBUG - Credentials:', credentials.substring(0, 20) + '...');
    
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

  // Simple token auth
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

    // List all manual requests
    const keys = await env.REPORT_QUEUE_KV.list({ prefix: 'manual:' });
    const manualRequests = [];

    for (const key of keys.keys) {
      const value = await env.REPORT_QUEUE_KV.get(key.name);
      if (value) {
        manualRequests.push(JSON.parse(value));
      }
    }

    return new Response(JSON.stringify({
      success: true,
      count: manualRequests.length,
      requests: manualRequests
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

    // TODO: Implement actual report generation logic here
    // For now, just acknowledge receipt

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
