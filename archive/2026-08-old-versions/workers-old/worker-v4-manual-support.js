/**
 * AIdriven.biz WhatsApp Webhook Handler - VERSION 4 (Manual Processing Support)
 * Date: 2026-08-17
 * 
 * NEW FEATURES IN V4:
 * - Support for manual processing flags (Rates, Council Fees)
 * - Route manual requests to Gerhard instead of auto-processing
 * - Store add-on selections in request payload
 * - Backward compatible with v3 conversational flow
 * 
 * Environment Variables Required:
 * - WHATSAPP_PHONE_NUMBER_ID: Meta phone number ID
 * - WHATSAPP_ACCESS_TOKEN: Meta access token
 * - WEBHOOK_VERIFY_TOKEN: Token for webhook verification
 * - POLL_API_TOKEN: Secret token for OpenClaw polling
 * - REPORT_QUEUE_KV: Cloudflare KV namespace binding
 * - GERHARD_WHATSAPP_NUMBER: Your WhatsApp number for manual routing (+27210000000)
 * 
 * Endpoints:
 * - GET /test - Health check
 * - GET/POST /webhook or / - Meta webhook
 * - GET /poll?token=*** - Fetch pending requests
 * - POST /send - Send WhatsApp message
 * - POST /update - Update request status
 * - POST /queue-manual - Queue manual processing request (NEW)
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Test endpoint
    if (url.pathname === '/test') {
      return new Response(JSON.stringify({
        status: 'ok',
        timestamp: new Date().toISOString(),
        worker: 'aidriven-whatsapp-webhook-v4',
        version: '2026-08-17-manual-processing',
        features: ['conversational', 'manual-processing-routing'],
        env_vars: {
          has_phone_id: !!env.WHATSAPP_PHONE_NUMBER_ID,
          has_token: !!env.WHATSAPP_ACCESS_TOKEN,
          has_verify_token: !!env.WEBHOOK_VERIFY_TOKEN,
          has_kv: !!env.REPORT_QUEUE_KV,
          has_poll_token: !!env.POLL_API_TOKEN,
          has_gerhard_number: !!env.GERHARD_WHATSAPP_NUMBER
        }
      }, null, 2), {
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // Poll endpoint
    if (url.pathname === '/poll') {
      return handlePoll(request, env);
    }

    // Send endpoint
    if (url.pathname === '/send' && request.method === 'POST') {
      return handleSend(request, env);
    }

    // Update endpoint
    if (url.pathname === '/update' && request.method === 'POST') {
      return handleUpdate(request, env);
    }

    // Manual queue endpoint (NEW)
    if (url.pathname === '/queue-manual' && request.method === 'POST') {
      return handleManualQueue(request, env);
    }

    // Webhook handling
    if (request.method === 'GET' && (url.pathname === '/' || url.pathname === '/webhook')) {
      return handleVerification(request, env);
    }

    if (request.method === 'POST' && (url.pathname === '/' || url.pathname === '/webhook')) {
      return handleWebhook(request, env);
    }

    return new Response('Not found', { status: 404 });
  }
};

// [Keep all existing functions from v3: handleVerification, handleWebhook, processMessage, parseMessage, etc.]
// [Only changes are shown below - copy rest from worker-v3-conversational.js]

/**
 * Create and confirm request - UPDATED to handle manual processing flags
 */
async function createAndConfirmRequest({ sessionId, contactName, address, reportType, rawMessage, previousContext, env, addons = {} }) {
  const requestId = `req_${Date.now()}_${sessionId.slice(-6)}`;
  
  // Check if this request requires manual processing
  const requiresManual = addons.ratesInfo || addons.councilFees;
  
  const requestData = {
    id: requestId,
    sessionId,
    customer: {
      name: contactName,
      phone: sessionId,
      whatsappId: sessionId
    },
    address,
    reportType,
    package: reportType.toLowerCase(), // Map reportType to package
    addons: addons,
    requiresManualProcessing: requiresManual,
    status: requiresManual ? 'pending_manual' : 'pending',
    createdAt: new Date().toISOString(),
    rawMessage,
    previousContext
  };

  console.log(`📝 Creating request ${requestId}`, {
    requiresManual: requiresManual,
    addons,
    status: requestData.status
  });

  // Store in KV queue
  if (env.REPORT_QUEUE_KV) {
    // If manual processing required, store separately for Gerhard to review
    if (requiresManual) {
      await env.REPORT_QUEUE_KV.put(
        `manual:${requestId}`,
        JSON.stringify(requestData),
        { expirationTtl: 7 * 24 * 60 * 60 } // 7 days TTL
      );
      
      console.log(`⚠️ Request queued for MANUAL processing`);
      
      // Notify customer about manual processing
      await sendWhatsAppMessage(sessionId, env, {
        type: 'text',
        text: {
          body: `Thanks for your order! 🎉

📍 Property: ${address}
📊 Package: ${reportType}
➕ Add-ons: ${formatAddons(addons)}

⚠️ IMPORTANT: Your request includes manual processing items (Rates/Council Fees).

WHAT HAPPENS NEXT:
1. Gerhard will personally process your request within 24-48 hours
2. You'll receive an email confirmation shortly
3. Your complete report will be delivered via email + WhatsApp

For urgent inquiries: +27 71 461 0886

Thank you for choosing AI Driven! 🏠`
        }
      });
      
      // Notify Gerhard (optional - can be disabled)
      if (env.GERHARD_WHATSAPP_NUMBER) {
        await sendWhatsAppMessage(env.GERHARD_WHATSAPP_NUMBER, env, {
          type: 'text',
          text: {
            body: `🔔 MANUAL PROCESSING REQUIRED

📋 New Request: ${requestId}
👤 Customer: ${contactName}
📍 Address: ${address}
📦 Package: ${reportType}
➕ Add-ons: ${formatAddons(addons)}

Please process manually within 24-48h.`
          }
        });
      }
      
    } else {
      // Standard automated processing - use existing queue
      await env.REPORT_QUEUE_KV.put(
        `request:${requestId}`,
        JSON.stringify(requestData),
        { expirationTtl: 24 * 60 * 60 } // 24 hours TTL
      );
      
      // Send standard confirmation
      await sendWhatsAppMessage(sessionId, env, {
        type: 'text',
        text: {
          body: `Thanks for your order! 🎉

📍 Property: ${address}
📊 Package: ${reportType}

Your automated report is being generated and will be ready in 15-60 minutes. You'll receive a WhatsApp message with the report link once it's ready.

Questions? Reply to this message!

AI Driven 🏠`
        }
      });
    }
  }

  return requestId;
}

/**
 * Format add-ons for display
 */
function formatAddons(addons) {
  const items = [];
  if (addons.ratesInfo) items.push('Rates Information');
  if (addons.councilFees) items.push('Council Fees');
  if (addons.rushDelivery) items.push('Rush Delivery');
  if (addons.comparison) items.push('Property Comparison');
  
  return items.length > 0 ? items.join(', ') : 'None';
}

/**
 * Handle manual processing queue endpoint (NEW)
 * For Google Forms submissions that need manual work
 */
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
      source: 'google-form', // vs 'whatsapp'
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
      
      // Notify Gerhard via WhatsApp (if env var is set)
      if (env.GERHARD_WHATSAPP_NUMBER) {
        try {
          const notifyUrl = `https://graph.facebook.com/v17.0/${env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
          const notifyPayload = {
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: env.GERHARD_WHATSAPP_NUMBER.replace('+', ''),
            type: 'text',
            text: {
              body: `🔔 MANUAL PROCESSING REQUIRED\n\n📋 New Request: ${requestId}\n👤 Customer: ${customer.name || 'N/A'}\n📧 Email: ${customer.email || 'N/A'}\n📍 Address: ${address}\n📦 Package: ${pkg || 'basic'}\n➕ Add-ons: ${addons?.ratesInfo ? 'Rates ' : ''}${addons?.councilFees ? 'Council Fees' : ''}\n\nPlease process manually within 24-48h.`
            }
          };
          
          const notifyResponse = await fetch(notifyUrl, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${env.WHATSAPP_ACCESS_TOKEN}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(notifyPayload)
          });
          
          if (notifyResponse.ok) {
            console.log(`✅ WhatsApp notification sent to ${env.GERHARD_WHATSAPP_NUMBER}`);
          } else {
            console.error(`❌ Failed to send WhatsApp notification: ${notifyResponse.statusText}`);
          }
        } catch (error) {
          console.error(`❌ Error sending WhatsApp notification: ${error.message}`);
        }
      }
      
      return new Response(JSON.stringify({
        success: true,
        requestId,
        status: 'queued_for_manual_processing'
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

/**
 * Handle poll - UPDATED to include manual requests
 */
async function handlePoll(request, env) {
  try {
    const url = new URL(request.url);
    const token = url.searchParams.get('token');
    
    if (token !== env.POLL_API_TOKEN) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid token'
      }), { status: 403, headers: { 'Content-Type': 'application/json' } });
    }
    
    // Only return automated requests (not manual ones)
    // Manual requests are handled separately by Gerhard
    const requests = [];
    
    if (env.REPORT_QUEUE_KV) {
      const keys = await env.REPORT_QUEUE_KV.list({ prefix: 'request:' });
      
      for (const key of keys.keys) {
        const data = await env.REPORT_QUEUE_KV.get(key.name);
        if (data) {
          const request = JSON.parse(data);
          // Only include non-manual requests
          if (!request.requiresManualProcessing) {
            requests.push(request);
          }
        }
      }
    }
    
    return new Response(JSON.stringify({
      success: true,
      count: requests.length,
      requests
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    
  } catch (error) {
    console.error('❌ Poll error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

// [Copy remaining functions from worker-v3-conversational.js:
// - handleSend
// - handleUpdate  
// - sendWhatsAppMessage
// - saveContext
// - generateReportTypeMenu
// - generateAddressRequest
// - generateWelcomeTemplate
// - parseMessage
// ]
