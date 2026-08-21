/**
 * AIdriven.biz WhatsApp Webhook Handler - VERSION 3 (Conversational State)
 * Date: 2026-08-15
 * 
 * Features:
 * - Conversational state management (multi-turn conversations)
 * - Report type detection: LIM, Basic, Standard, Premium
 * - Smart address extraction with flexible parsing
 * - KV-based session context with 24h TTL
 * - Professional response scripts
 * 
 * Environment Variables Required:
 * - WHATSAPP_PHONE_NUMBER_ID: Meta phone number ID for API number (+27 79 944 8564)
 * - WHATSAPP_ACCESS_TOKEN: Meta access token
 * - WEBHOOK_VERIFY_TOKEN: Token for webhook verification (set in Meta Developer Console)
 * - POLL_API_TOKEN: Secret token for OpenClaw polling authentication
 * - REPORT_QUEUE_KV: Cloudflare KV namespace binding for request queue + session state
 * 
 * Endpoints:
 * - GET /test - Health check
 * - GET /webhook or / - Meta webhook verification & messages
 * - POST /webhook or / - Meta webhook message receiver
 * - GET /poll?token=*** - Fetch pending requests (OpenClaw polling)
 * - POST /send - Send WhatsApp message (OpenClaw)
 * - POST /update - Update request status (OpenClaw)
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Test endpoint - health check
    if (url.pathname === '/test') {
      return new Response(JSON.stringify({
        status: 'ok',
        timestamp: new Date().toISOString(),
        worker: 'aidriven-whatsapp-webhook-v3',
        version: '2026-08-15-conversational',
        env_vars: {
          has_phone_id: !!env.WHATSAPP_PHONE_NUMBER_ID,
          has_token: !!env.WHATSAPP_ACCESS_TOKEN,
          has_verify_token: !!env.WEBHOOK_VERIFY_TOKEN,
          has_kv: !!env.REPORT_QUEUE_KV,
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
 * Process individual WhatsApp message with conversational state
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

  const contactName = contacts?.[0]?.profile?.name || 'there';
  const sessionId = from; // Use phone number as session ID

  // Retrieve existing conversation context (if any)
  let context = null;
  if (env.REPORT_QUEUE_KV) {
    const contextData = await env.REPORT_QUEUE_KV.get(`session:${sessionId}`);
    if (contextData) {
      context = JSON.parse(contextData);
      console.log(`📚 Retrieved existing context for ${sessionId}:`, context);
    }
  }

  // Parse incoming message
  const parsed = parseMessage(messageText);
  console.log(`🔍 Parsed message:`, parsed);

  // State machine logic
  if (!context) {
    // NEW CONVERSATION
    console.log('🆕 New conversation detected');
    
    if (parsed.address && parsed.reportType) {
      // BOTH PROVIDED - Create request immediately
      await createAndConfirmRequest({
        sessionId,
        contactName,
        address: parsed.address,
        reportType: parsed.reportType,
        rawMessage: messageText,
        env
      });
    } else if (parsed.address && !parsed.reportType) {
      // ADDRESS ONLY - Store context, ask for report type
      console.log('📍 Address only - asking for report type');
      await saveContext(env, sessionId, {
        state: 'AWAITING_REPORT_TYPE',
        address: parsed.address,
        reportType: null,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24h TTL
        messageCount: 1
      });
      
      const reply = generateReportTypeMenu(parsed.address);
      await sendWhatsAppMessage(from, env, {
        type: 'text',
        text: { body: reply }
      });
      
    } else if (!parsed.address && parsed.reportType) {
      // REPORT TYPE ONLY - Store context, ask for address
      console.log('📦 Report type only - asking for address');
      await saveContext(env, sessionId, {
        state: 'AWAITING_ADDRESS',
        address: null,
        reportType: parsed.reportType,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        messageCount: 1
      });
      
      const reply = generateAddressRequest(parsed.reportType);
      await sendWhatsAppMessage(from, env, {
        type: 'text',
        text: { body: reply }
      });
      
    } else {
      // NEITHER - Send template example
      console.log('❓ Neither found - sending template');
      await saveContext(env, sessionId, {
        state: 'AWAITING_FULL_REQUEST',
        address: null,
        reportType: null,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        messageCount: 1
      });
      
      const reply = generateWelcomeTemplate();
      await sendWhatsAppMessage(from, env, {
        type: 'text',
        text: { body: reply }
      });
    }
    
  } else {
    // CONTINUING CONVERSATION
    console.log(`🔄 Continuing conversation in state: ${context.state}`);
    
    if (context.state === 'AWAITING_REPORT_TYPE' && parsed.reportType) {
      // Got the missing report type - create request
      console.log('✅ Got report type - creating request');
      await createAndConfirmRequest({
        sessionId,
        contactName,
        address: context.address,
        reportType: parsed.reportType,
        rawMessage: messageText,
        previousContext: context,
        env
      });
      
    } else if (context.state === 'AWAITING_ADDRESS' && parsed.address) {
      // Got the missing address - create request
      console.log('✅ Got address - creating request');
      await createAndConfirmRequest({
        sessionId,
        contactName,
        address: parsed.address,
        reportType: context.reportType,
        rawMessage: messageText,
        previousContext: context,
        env
      });
      
    } else if (context.state === 'AWAITING_FULL_REQUEST' && (parsed.address || parsed.reportType)) {
      // User provided something - continue gathering
      console.log('📝 Partial info received in AWAITING_FULL_REQUEST');
      
      const newContext = {
        state: '',
        address: parsed.address || context.address,
        reportType: parsed.reportType || context.reportType,
        createdAt: context.createdAt,
        expiresAt: context.expiresAt,
        messageCount: context.messageCount + 1
      };
      
      // Determine next state
      if (newContext.address && newContext.reportType) {
        // Both now available - create request
        await createAndConfirmRequest({
          sessionId,
          contactName,
          address: newContext.address,
          reportType: newContext.reportType,
          rawMessage: messageText,
          previousContext: context,
          env
        });
      } else if (newContext.address && !newContext.reportType) {
        newContext.state = 'AWAITING_REPORT_TYPE';
        await saveContext(env, sessionId, newContext);
        await sendWhatsAppMessage(from, env, {
          type: 'text',
          text: { body: generateReportTypeMenu(newContext.address) }
        });
      } else if (!newContext.address && newContext.reportType) {
        newContext.state = 'AWAITING_ADDRESS';
        await saveContext(env, sessionId, newContext);
        await sendWhatsAppMessage(from, env, {
          type: 'text',
          text: { body: generateAddressRequest(newContext.reportType) }
        });
      }
      
    } else {
      // Wrong info or still incomplete - gentle clarification
      console.log('⚠️ Still missing information - asking for clarification');
      
      let clarificationMsg = '';
      if (context.state === 'AWAITING_REPORT_TYPE') {
        clarificationMsg = `Thanks for your message! 😊\n\nI'm still waiting to know which **report package** you'd like for:\n\n📍 ${context.address}\n\nPlease reply with one of:\n• **LIM** - Council LIM report\n• **Basic** - Property ID & automated checks\n• **Standard** - Basic + LINZ title data\n• **Premium** - Full comprehensive report`;
      } else if (context.state === 'AWAITING_ADDRESS') {
        clarificationMsg = `Thanks for your message! 😊\n\nI'm still waiting for the **property address** for your **${context.reportType}** report.\n\nPlease send the full address, e.g.:\n• "16 Ferguson Avenue, Napier"\n• "42 Marine Parade, Hastings"`;
      } else {
        clarificationMsg = `Thanks for reaching out! 😊\n\nTo get started, I need both:\n1️⃣ **Report type** (LIM, Basic, Standard, or Premium)\n2️⃣ **Property address**\n\nExample: "Standard report for 16 Ferguson Avenue, Napier"\n\nWhat property can we help you research today?`;
      }
      
      await sendWhatsAppMessage(from, env, {
        type: 'text',
        text: { body: clarificationMsg }
      });
    }
  }
}

/**
 * Parse message text for address and report type
 */
function parseMessage(text) {
  const lower = text.toLowerCase();
  let reportType = null;
  let address = null;
  
  // Detect report type
  if (lower.includes('premium')) {
    reportType = 'Premium';
  } else if (lower.includes('standard')) {
    reportType = 'Standard';
  } else if (lower.includes('basic')) {
    reportType = 'Basic';
  } else if (lower.includes('lim') || lower.includes('land information')) {
    reportType = 'LIM';
  }
  
  // Extract address (remove report type keywords first)
  let cleaned = text
    .replace(/^(lim report for|due diligence for|i need|please|can i get|standard report for|basic report for|premium report for)/i, '')
    .trim();
  
  // Address patterns (NZ-focused)
  const addressPatterns = [
    /(\d+[a-z]?\s+[^,\n]+(?:\s+(?:street|st|road|rd|avenue|ave|drive|dr|lane|ln|court|ct|place|pl|way|boulevard|blvd))[^,\n]*(?:,\s*[^,\n]+)?)/i,
    /([^,\n]+\d+[^,\n]*(?:street|st|road|rd|avenue|ave|drive|dr|lane|ln|court|ct|place|pl|way|boulevard|blvd)[^,\n]*(?:,\s*[^,\n]+)?)/i
  ];
  
  for (const pattern of addressPatterns) {
    const match = cleaned.match(pattern);
    if (match && match[0].length > 10) {
      address = match[0].trim();
      break;
    }
  }
  
  // Fallback: if cleaned text looks like an address
  if (!address && cleaned.length > 15 && /\d/.test(cleaned)) {
    address = cleaned;
  }
  
  return { reportType, address };
}

/**
 * Generate report type menu message
 */
function generateReportTypeMenu(address) {
  return `Thanks for your request! 🏠\n\nWhich due diligence package would you like for **${address}**?\n\n📋 **LIM** - Council LIM report facilitation\n📊 **Basic** - Property identification & automated checks\n📈 **Standard** - Basic + LINZ title data, ownership, easements\n💎 **Premium** - Standard + Natural hazards, rates, consents\n\nReply with: **LIM**, **Basic**, **Standard**, or **Premium**`;
}

/**
 * Generate address request message
 */
function generateAddressRequest(reportType) {
  return `Perfect! 📦 Which property should we generate the **${reportType}** report for?\n\nPlease send the full address, for example:\n• 16 Ferguson Avenue, Napier\n• 42 Marine Parade, Hastings\n• 7B Worcester Street, Christchurch`;
}

/**
 * Generate welcome template for unclear messages
 */
function generateWelcomeTemplate() {
  return `Welcome to AI Driven Due Diligence! 🏠\n\nTo get started, please send your request in this format:\n\n**[Report Type] for [Property Address]**\n\nExamples:\n• "LIM for 16 Ferguson Avenue, Napier"\n• "Standard report for 42 Marine Parade"\n• "Premium due diligence for 7B Worcester Street, Christchurch"\n\nOur packages:\n📋 **LIM** | 📊 **Basic** | 📈 **Standard** | 💎 **Premium**\n\nWhat property can we help you research today?`;
}

/**
 * Save conversation context to KV
 */
async function saveContext(env, sessionId, context) {
  if (!env.REPORT_QUEUE_KV) {
    console.log('⚠️ KV not available - cannot save context');
    return false;
  }
  
  const contextKey = `session:${sessionId}`;
  await env.REPORT_QUEUE_KV.put(contextKey, JSON.stringify(context), {
    expirationTtl: 24 * 60 * 60 // 24 hours
  });
  
  console.log(`✅ Context saved: ${contextKey}`);
  return true;
}

/**
 * Create request and send confirmation
 */
async function createAndConfirmRequest({ sessionId, contactName, address, reportType, rawMessage, previousContext, env }) {
  const queueEntry = {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    customer: {
      phone: sessionId,
      name: contactName
    },
    requestType: reportType,
    address: address,
    rawMessage: rawMessage,
    status: 'pending',
    receivedAt: Date.now(),
    conversationHistory: previousContext ? [previousContext] : []
  };
  
  console.log(`📝 Creating request: ${queueEntry.id}`);
  
  // Store in KV
  if (env.REPORT_QUEUE_KV) {
    const queueKey = `requests/${queueEntry.id}.json`;
    await env.REPORT_QUEUE_KV.put(queueKey, JSON.stringify(queueEntry));
    console.log(`✅ Stored in KV: ${queueKey}`);
    
    // Clear session context (no longer needed)
    await env.REPORT_QUEUE_KV.delete(`session:${sessionId}`);
    console.log(`✅ Cleared session context for ${sessionId}`);
  }
  
  // Send confirmation reply
  const replyText = `✅ Perfect! Generating your **${reportType}** Due Diligence report for:\n\n📍 **${address}**\n📦 **Package:** ${reportType}\n🆔 **Order ID:** ${queueEntry.id.slice(0, 8)}\n\nThis usually takes 2-5 minutes. You'll receive a link to view your report shortly!\n\nQuestions? Contact us on +27 71 461 0886 (Business WhatsApp).`;
  
  console.log(`📤 Sending confirmation to ${sessionId}`);
  
  await sendWhatsAppMessage(sessionId, env, {
    type: 'text',
    text: { body: replyText }
  });
  
  console.log('✅ Confirmation sent successfully');
}

/**
 * Handle polling from OpenClaw
 */
async function handlePoll(request, env) {
  const url = new URL(request.url);
  const token = url.searchParams.get('token');

  if (!token || token !== env.POLL_API_TOKEN) {
    console.log('❌ Poll request rejected - invalid token');
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
    if (!env.REPORT_QUEUE_KV) {
      return new Response(JSON.stringify({
        error: 'KV not configured',
        requests: []
      }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const keys = await env.REPORT_QUEUE_KV.list({ prefix: 'requests/' });
    console.log(`📂 Found ${keys.keys.length} request(s) in KV`);

    const pendingRequests = [];

    for (const key of keys.keys) {
      const data = await env.REPORT_QUEUE_KV.get(key.name);
      if (!data) continue;

      try {
        const request = JSON.parse(data);
        
        if (request.status === 'pending' || request.status === 'processing') {
          request.status = 'processing';
          request.processingStartedAt = new Date().toISOString();
          await env.REPORT_QUEUE_KV.put(key.name, JSON.stringify(request));
          
          pendingRequests.push(request);
          console.log(`📋 Queued: ${request.id} (${request.requestType}) for ${request.address}`);
        }
      } catch (parseError) {
        console.error('❌ Failed to parse request:', key.name, parseError.message);
      }
    }

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
 * Send WhatsApp message via Meta API
 */
async function sendWhatsAppMessage(to, env, payload) {
  const phoneNumberId = env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = env.WHATSAPP_ACCESS_TOKEN;
  
  if (!phoneNumberId || !accessToken) {
    console.error('❌ Missing WhatsApp credentials');
    throw new Error('Missing WhatsApp credentials');
  }
  
  const apiUrl = `https://graph.facebook.com/v17.0/${phoneNumberId}/messages`;
  
  const requestBody = {
    messaging_product: 'whatsapp',
    to: to.replace(/\D/g, ''),
    ...payload
  };

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
      throw new Error(`WhatsApp API error: ${response.status}`);
    }
    
    return result;
  } catch (error) {
    console.error('❌ Failed to send message:', error.message);
    throw error;
  }
}

/**
 * Handle /send endpoint
 */
async function handleSend(request, env) {
  const authToken = request.headers.get('Authorization')?.replace('Bearer ', '');
  
  if (!authToken || authToken !== env.POLL_API_TOKEN) {
    return new Response(JSON.stringify({
      error: 'Unauthorized',
      message: 'Invalid token'
    }), { status: 401, headers: { 'Content-Type': 'application/json' } });
  }

  try {
    const body = await request.json();
    const { to, message } = body;

    if (!to || !message) {
      return new Response(JSON.stringify({
        error: 'Bad Request',
        message: 'Missing "to" or "message"'
      }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const result = await sendWhatsAppMessage(to, env, {
      type: 'text',
      text: { body: message }
    });

    return new Response(JSON.stringify({
      success: true,
      messageId: result.messages?.[0]?.id || 'unknown'
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });

  } catch (error) {
    return new Response(JSON.stringify({
      error: 'Internal error',
      message: error.message
    }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

/**
 * Handle /update endpoint
 */
async function handleUpdate(request, env) {
  const authToken = request.headers.get('Authorization')?.replace('Bearer ', '');
  
  if (!authToken || authToken !== env.POLL_API_TOKEN) {
    return new Response(JSON.stringify({
      error: 'Unauthorized'
    }), { status: 401, headers: { 'Content-Type': 'application/json' } });
  }

  try {
    const body = await request.json();
    const { requestId, status, result } = body;

    if (!requestId || !status) {
      return new Response(JSON.stringify({
        error: 'Bad Request',
        message: 'Missing requestId or status'
      }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    if (!env.REPORT_QUEUE_KV) {
      return new Response(JSON.stringify({ error: 'KV not configured' }), { status: 503, headers: { 'Content-Type': 'application/json' } });
    }

    const queueKey = `requests/${requestId}.json`;
    const existingData = await env.REPORT_QUEUE_KV.get(queueKey);
    
    if (!existingData) {
      return new Response(JSON.stringify({ error: 'Not Found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
    }

    const requestData = JSON.parse(existingData);
    requestData.status = status;
    requestData.completedAt = new Date().toISOString();
    requestData.result = result || {};

    await env.REPORT_QUEUE_KV.put(queueKey, JSON.stringify(requestData));

    return new Response(JSON.stringify({
      success: true,
      requestId,
      status
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });

  } catch (error) {
    return new Response(JSON.stringify({
      error: 'Internal error',
      message: error.message
    }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
