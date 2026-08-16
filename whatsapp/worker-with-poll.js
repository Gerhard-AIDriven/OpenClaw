/**
 * AIdriven.biz WhatsApp Webhook Handler with Polling Endpoint
 * Version: 2026-08-10
 * 
 * Endpoints:
 * - GET /test - Health check
 * - GET /webhook or / - Meta webhook verification & messages
 * - POST /webhook or / - Meta webhook message receiver
 * - GET /poll?token=XXX - Fetch pending requests (OpenClaw polling)
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Test endpoint - health check
    if (url.pathname === '/test') {
      return new Response(JSON.stringify({
        status: 'ok',
        timestamp: new Date().toISOString(),
        worker: 'aidriven-whatsapp-webhook',
        version: '2026-08-10-with-poll',
        env_vars: {
          has_phone_id: !!env.WHATSAPP_PHONE_NUMBER_ID,
          has_token: !!env.WHATSAPP_ACCESS_TOKEN,
          has_verify_token: !!env.WEBHOOK_VERIFY_TOKEN,
          has_kv: !!env.LIM_QUEUE_KV,
          has_poll_token: !!env.POLL_API_TOKEN,
          phone_number_id: env.WHATSAPP_PHONE_NUMBER_ID || 'MISSING',
          business_account_id: env.WHATSAPP_BUSINESS_ACCOUNT_ID || 'MISSING'
        }
      }, null, 2), {
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // Poll endpoint - for OpenClaw to fetch pending requests
    if (url.pathname === '/poll') {
      console.log('📡 Poll request received');
      return handlePoll(request, env);
    }

    // Send endpoint - for OpenClaw to send WhatsApp messages
    if (url.pathname === '/send' && request.method === 'POST') {
      console.log('📤 Send request received');
      return handleSend(request, env);
    }

    // Update endpoint - for OpenClaw to update request status
    if (url.pathname === '/update' && request.method === 'POST') {
      console.log('✏️ Update request received');
      return handleUpdate(request, env);
    }

    // Handle Meta webhook verification (GET request)
    if (request.method === 'GET' && (url.pathname === '/' || url.pathname === '/webhook')) {
      console.log('🔍 Webhook verification GET request');
      return handleVerification(request, env);
    }

    // Handle incoming messages (POST request)
    if (request.method === 'POST' && (url.pathname === '/' || url.pathname === '/webhook')) {
      console.log('📨 Webhook message POST request');
      return handleWebhook(request, env);
    }

    // Any other path returns 404
    console.log(`⚠️ Unknown path: ${url.pathname}`);
    return new Response('Not found', { status: 404 });
  }
};

/**
 * Handle Meta's webhook verification challenge
 */
function handleVerification(request, env) {
  const url = new URL(request.url);
  const mode = url.searchParams.get('hub.mode');
  const token = url.searchParams.get('hub.verify_token');
  const challenge = url.searchParams.get('hub.challenge');

  console.log(`Verification: mode=${mode}, token_match=${token === env.WEBHOOK_VERIFY_TOKEN}`);

  if (mode === 'subscribe' && token === env.WEBHOOK_VERIFY_TOKEN) {
    console.log('✅ Webhook verified successfully!');
    return new Response(challenge, { status: 200 });
  }

  console.log('❌ Verification failed - token mismatch or wrong mode');
  return new Response('Forbidden', { status: 403 });
}

/**
 * Handle incoming WhatsApp messages from Meta
 */
async function handleWebhook(request, env) {
  try {
    const body = await request.json();
    console.log('📨 Received webhook payload:', JSON.stringify(body, null, 2));
    
    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const messages = value?.messages;
    const contacts = value?.contacts;

    if (!messages || messages.length === 0) {
      console.log('⚠️ No messages in webhook payload');
      return new Response('No messages', { status: 200 });
    }

    console.log(`📱 Processing ${messages.length} message(s)`);

    for (const message of messages) {
      await processMessage(message, contacts, env);
    }

    return new Response('OK', { status: 200 });
  } catch (error) {
    console.error('❌ Webhook error:', error.message, error.stack);
    return new Response('Error: ' + error.message, { status: 500 });
  }
}

/**
 * Process individual WhatsApp message
 */
async function processMessage(message, contacts, env) {
  const from = message.from;
  const messageId = message.id;
  let messageText = '';
  
  if (message.type === 'text') {
    messageText = message.text?.body || '';
  } else if (message.type === 'interactive') {
    messageText = message.interactive?.button_reply?.title || 
                  message.interactive?.list_reply?.id || '';
  }

  console.log(`💬 Message from ${from}: "${messageText}"`);

  if (!messageText.trim()) {
    console.log('⚠️ No text content in message');
    return;
  }

  const requestType = detectRequestType(messageText);
  const address = extractAddress(messageText);

  if (!address) {
    console.log('⚠️ No address found in message');
    await sendWhatsAppMessage(from, env, {
      type: 'text',
      text: {
        body: `👋 Hi! I received your message, but I couldn't find a property address.\n\nPlease reply with the full address, e.g.:\n"LIM report for 123 Marine Parade, Napier"`
      }
    });
    return;
  }

  const contactName = contacts?.[0]?.profile?.name || 'there';

  // Create queue entry
  const queueEntry = {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    customer: {
      phone: from,
      name: contactName
    },
    requestType: requestType,
    address: address,
    rawMessage: messageText,
    status: 'pending',
    receivedAt: Date.now()
  };

  console.log(`📝 Storing in queue: ${queueEntry.id}`);

  // Store in KV
  if (env.LIM_QUEUE_KV) {
    const queueKey = `requests/${queueEntry.id}.json`;
    await env.LIM_QUEUE_KV.put(queueKey, JSON.stringify(queueEntry));
    console.log(`✅ Stored in KV: ${queueKey}`);
  } else {
    console.log('⚠️ KV not configured - message logged but not stored');
  }

  // Send confirmation reply
  const replyText = `✅ Thank you ${contactName}!\n\nI've received your ${requestType === 'LIM' ? 'LIM report' : 'Due Diligence'} request for:\n\n📍 ${address}\n\nYour order has been queued and will be processed ${requestType === 'LIM' ? 'today' : 'within 24 hours'}. You'll receive the report via WhatsApp once complete.\n\nOrder ID: ${queueEntry.id.slice(0, 8)}\n\nQuestions? Reply to this message anytime.`;

  console.log(`📤 Sending reply to ${from}`);
  
  await sendWhatsAppMessage(from, env, {
    type: 'text',
    text: { body: replyText }
  });

  console.log('✅ Reply sent successfully');
}

/**
 * Handle polling from OpenClaw
 * Returns array of pending requests and marks them as processing
 */
async function handlePoll(request, env) {
  const url = new URL(request.url);
  const token = url.searchParams.get('token');

  // Authenticate the poll request
  if (!token || token !== env.POLL_API_TOKEN) {
    console.log('❌ Poll request rejected - invalid or missing token');
    return new Response(JSON.stringify({
      error: 'Unauthorized',
      message: 'Invalid or missing API token'
    }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  console.log('✅ Poll request authenticated');

  try {
    if (!env.LIM_QUEUE_KV) {
      console.log('⚠️ KV store not configured');
      return new Response(JSON.stringify({
        error: 'KV not configured',
        requests: []
      }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // List all keys in the requests prefix
    const keys = await env.LIM_QUEUE_KV.list({ prefix: 'requests/' });
    console.log(`📂 Found ${keys.keys.length} request(s) in KV`);

    const pendingRequests = [];

    for (const key of keys.keys) {
      const data = await env.LIM_QUEUE_KV.get(key.name);
      if (!data) continue;

      try {
        const request = JSON.parse(data);
        
        // Only return pending or processing requests (in case of retry)
        if (request.status === 'pending' || request.status === 'processing') {
          // Mark as processing to avoid duplicate handling
          request.status = 'processing';
          request.processingStartedAt = new Date().toISOString();
          await env.LIM_QUEUE_KV.put(key.name, JSON.stringify(request));
          
          pendingRequests.push(request);
          console.log(`📋 Queued request: ${request.id} (${request.requestType}) for ${request.address}`);
        }
      } catch (parseError) {
        console.error('❌ Failed to parse request:', key.name, parseError.message);
      }
    }

    console.log(`✅ Returning ${pendingRequests.length} pending request(s)`);

    return new Response(JSON.stringify({
      status: 'ok',
      count: pendingRequests.length,
      requests: pendingRequests,
      polledAt: new Date().toISOString()
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error('❌ Poll error:', error.message, error.stack);
    return new Response(JSON.stringify({
      error: 'Internal error',
      message: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Detect request type from message text
 */
function detectRequestType(text) {
  const lower = text.toLowerCase();
  if (lower.includes('lim') || lower.includes('land information')) {
    return 'LIM';
  }
  if (lower.includes('due diligence') || lower.includes('dd ') || lower.startsWith('dd')) {
    return 'Due Diligence';
  }
  return 'LIM'; // Default
}

/**
 * Extract property address from message text
 */
function extractAddress(text) {
  let cleaned = text.replace(/^(lim report for|due diligence for|i need|please|can i get)/i, '').trim();
  
  const addressPatterns = [
    /(\d+[a-z]?\s+[^,\n]+(?:\s+(?:street|st|road|rd|avenue|ave|drive|dr|lane|ln|court|ct|place|pl|way|boulevard|blvd))[^,\n]*(?:,\s*[^,\n]+)?)/i,
    /([^,\n]+\d+[^,\n]*(?:street|st|road|rd|avenue|ave|drive|dr|lane|ln|court|ct|place|pl|way|boulevard|blvd)[^,\n]*(?:,\s*[^,\n]+)?)/i
  ];
  
  for (const pattern of addressPatterns) {
    const match = cleaned.match(pattern);
    if (match && match[0].length > 10) {
      return match[0].trim();
    }
  }
  
  if (cleaned.length > 15 && /\d/.test(cleaned)) {
    return cleaned;
  }
  
  return null;
}

/**
 * Send WhatsApp message via Meta API
 */
async function sendWhatsAppMessage(to, env, payload) {
  const phoneNumberId = env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = env.WHATSAPP_ACCESS_TOKEN;
  
  if (!phoneNumberId || !accessToken) {
    console.error('❌ Missing phone number ID or access token');
    throw new Error('Missing WhatsApp credentials');
  }
  
  const apiUrl = `https://graph.facebook.com/v17.0/${phoneNumberId}/messages`;
  
  const requestBody = {
    messaging_product: 'whatsapp',
    to: to.replace(/\D/g, ''),
    ...payload
  };

  console.log(`📡 Sending to WhatsApp API: ${apiUrl}`);

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const result = await response.json();
    
    if (!response.ok) {
      console.error('❌ WhatsApp API error:', response.status, result);
      throw new Error(`WhatsApp API error: ${response.status} - ${JSON.stringify(result)}`);
    }
    
    console.log('✅ WhatsApp API response:', result);
    return result;
  } catch (error) {
    console.error('❌ Failed to send WhatsApp message:', error.message);
    throw error;
  }
}

/**
 * Handle /send endpoint - Send WhatsApp message from OpenClaw
 */
async function handleSend(request, env) {
  const authToken = request.headers.get('Authorization')?.replace('Bearer ', '');
  
  // Authenticate
  if (!authToken || authToken !== env.POLL_API_TOKEN) {
    console.log('❌ Send request rejected - invalid token');
    return new Response(JSON.stringify({
      error: 'Unauthorized',
      message: 'Invalid or missing API token'
    }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const body = await request.json();
    const { to, message } = body;

    if (!to || !message) {
      return new Response(JSON.stringify({
        error: 'Bad Request',
        message: 'Missing "to" or "message" field'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log(`📤 Sending message to ${to}: ${message.substring(0, 50)}...`);

    const result = await sendWhatsAppMessage(to, env, {
      type: 'text',
      text: { body: message }
    });

    console.log('✅ Message sent successfully via /send endpoint');

    return new Response(JSON.stringify({
      success: true,
      messageId: result.messages?.[0]?.id || 'unknown'
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error('❌ Send endpoint error:', error.message);
    return new Response(JSON.stringify({
      error: 'Internal error',
      message: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Handle /update endpoint - Update request status in KV
 */
async function handleUpdate(request, env) {
  const authToken = request.headers.get('Authorization')?.replace('Bearer ', '');
  
  // Authenticate
  if (!authToken || authToken !== env.POLL_API_TOKEN) {
    console.log('❌ Update request rejected - invalid token');
    return new Response(JSON.stringify({
      error: 'Unauthorized',
      message: 'Invalid or missing API token'
    }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const body = await request.json();
    const { requestId, status, result } = body;

    if (!requestId || !status) {
      return new Response(JSON.stringify({
        error: 'Bad Request',
        message: 'Missing "requestId" or "status" field'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!env.LIM_QUEUE_KV) {
      return new Response(JSON.stringify({
        error: 'Service Unavailable',
        message: 'KV store not configured'
      }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const queueKey = `requests/${requestId}.json`;
    const existingData = await env.LIM_QUEUE_KV.get(queueKey);
    
    if (!existingData) {
      return new Response(JSON.stringify({
        error: 'Not Found',
        message: `Request ${requestId} not found`
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const requestData = JSON.parse(existingData);
    
    // Update the request
    requestData.status = status;
    requestData.completedAt = new Date().toISOString();
    requestData.result = result || {};

    await env.LIM_QUEUE_KV.put(queueKey, JSON.stringify(requestData));

    console.log(`✅ Request ${requestId} updated to status: ${status}`);

    return new Response(JSON.stringify({
      success: true,
      requestId: requestId,
      status: status
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error('❌ Update endpoint error:', error.message);
    return new Response(JSON.stringify({
      error: 'Internal error',
      message: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
