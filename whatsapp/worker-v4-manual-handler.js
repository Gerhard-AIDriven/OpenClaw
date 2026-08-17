
/**
 * Handle manual processing queue endpoint (NEW in V4)
 * For Google Forms submissions that require manual work (Rates/Council Fees)
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
      
      // Notify Gerhard via WhatsApp
      if (env.GERHARD_WHATSAPP_NUMBER && env.WHATSAPP_PHONE_NUMBER_ID && env.WHATSAPP_ACCESS_TOKEN) {
        try {
          const notifyUrl = `https://graph.facebook.com/v17.0/${env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
          const notifyPayload = {
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: env.GERHARD_WHATSAPP_NUMBER.replace('+', ''),
            type: 'text',
            text: {
              body: `🔔 MANUAL PROCESSING REQUIRED\n\n📋 Request ID: ${requestId}\n👤 Customer: ${customer.name || 'N/A'}\n📧 Email: ${customer.email || 'N/A'}\n📍 Address: ${address}\n📦 Package: ${pkg || 'basic'}\n➕ Add-ons: ${addons?.ratesInfo ? 'Rates ' : ''}${addons?.councilFees ? 'Council Fees' : ''}\n\nPlease process manually within 24-48h.`
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
            const errorText = await notifyResponse.text();
            console.error(`❌ Failed to send notification: ${notifyResponse.status} - ${errorText}`);
          }
        } catch (error) {
          console.error(`❌ Error sending WhatsApp notification: ${error.message}`);
        }
      } else {
        console.log('⚠️ GERHARD_WHATSAPP_NUMBER not configured, skipping notification');
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
