/**
 * AIdriven.biz WhatsApp Webhook Handler - FIXED VERSION
 * Properly routes /test endpoint separately from webhook verification
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Test endpoint - visit in browser to verify Worker is running
    if (url.pathname === '/test') {
      return new Response(JSON.stringify({
        status: 'ok',
        timestamp: new Date().toISOString(),
        worker: 'aidriven-whatsapp-webhook',
        env_vars: {
          has_phone_id: !!env.WHATSAPP_PHONE_NUMBER_ID,
          has_token: !!env.WHATSAPP_ACCESS_TOKEN,
          has_verify_token: !!env.WEBHOOK_VERIFY_TOKEN,
          has_kv: !!env.LIM_QUEUE_KV,
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

    // Handle Meta webhook verification (GET request to root or /webhook)
    if (request.method === 'GET' && (url.pathname === '/' || url.pathname === '/webhook')) {
      console.log('Received GET request for webhook verification');
      return handleVerification(request, env);
    }

    // Handle incoming messages (POST request to root or /webhook)
    if (request.method === 'POST' && (url.pathname === '/' || url.pathname === '/webhook')) {
      console.log('Received POST request (webhook)');
      return handleWebhook(request, env);
    }

    // Any other path returns 404
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

  console.log(`Verification attempt: mode=${mode}, token_match=${token === env.WEBHOOK_VERIFY_TOKEN}`);

  // Check if mode and token match
  if (mode === 'subscribe' && token === env.WEBHOOK_VERIFY_TOKEN) {
    console.log('✅ Webhook verified successfully!');
    return new Response(challenge, { status: 200 });
  }

  console.log('❌ Verification failed - token mismatch or wrong mode');
  return new Response('Forbidden', { status: 403 });
}

/**
 * Handle incoming WhatsApp messages
 */
async function handleWebhook(request, env) {
  try {
    const body = await request.json();
    console.log('📨 Received webhook payload:', JSON.stringify(body, null, 2));
    
    // Extract message details
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

    // Process each message
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
  const timestamp = message.timestamp;
  
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

  // Determine request type and extract address
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
    const queueKey = `${requestType.toLowerCase().replace(' ', '-')}-queue/${queueEntry.id}.json`;
    await env.LIM_QUEUE_KV.put(queueKey, JSON.stringify(queueEntry));
    console.log(`✅ Stored in KV: ${queueKey}`);
  } else {
    console.log('⚠️ KV not configured - message logged but not stored');
  }

  // Send confirmation reply
  const queuePosition = requestType === 'LIM' ? 'today' : 'within 24 hours';
  const replyText = `✅ Thank you ${contactName}!\n\nI've received your ${requestType === 'LIM' ? 'LIM report' : 'Due Diligence'} request for:\n\n📍 ${address}\n\nYour order has been queued and will be processed ${queuePosition}. You'll receive the report via WhatsApp once complete.\n\nOrder ID: ${queueEntry.id.slice(0, 8)}\n\nQuestions? Reply to this message anytime.`;

  console.log(`📤 Sending reply to ${from}`);
  
  await sendWhatsAppMessage(from, env, {
    type: 'text',
    text: { body: replyText }
  });

  console.log('✅ Reply sent successfully');
}

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

async function sendWhatsAppMessage(to, env, payload) {
  const phoneNumberId = env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = env.WHATSAPP_ACCESS_TOKEN;
  
  if (!phoneNumberId || !accessToken) {
    console.error('❌ Missing phone number ID or access token');
    throw new Error('Missing credentials');
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
      throw new Error(`WhatsApp API error: ${response.status}`);
    }
    
    console.log('✅ WhatsApp API response:', result);
    return result;
  } catch (error) {
    console.error('❌ Failed to send WhatsApp message:', error.message);
    throw error;
  }
}
