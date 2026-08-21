/**
 * Simple Mailgun Test Worker - Minimal version to debug 401 issue
 * This exactly mirrors the working Python test_mg.py script
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Only respond to /test-email endpoint
    if (url.pathname === '/test-email' && request.method === 'POST') {
      try {
        // EXACT same values as working Python script
        const API_URL = "https://api.mailgun.net/v3/mg.aidriven.biz/messages";
        const API_KEY = "dea06fd768f566dfd3a35de38e3ddbb0-6648d8d0-c028d450";
        
        // Build form data exactly like Python requests library
        const params = new URLSearchParams();
        params.append('from', 'Gerhard <gerhard@mg.aidriven.biz>');
        params.append('to', 'gstimie@gmail.com');
        params.append('subject', 'Cloudflare Worker Test - SUCCESS!');
        params.append('text', 'If you receive this, the Cloudflare Worker + Mailgun integration is working perfectly! 🎉');
        
        // Create Basic Auth header exactly like Python requests.auth=("api", API_KEY)
        const credentials = btoa(`api:${API_KEY}`);
        
        console.log('🔍 Sending request to:', API_URL);
        console.log('🔍 Auth header starts with:', credentials.substring(0, 20));
        
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: {
            'Authorization': 'Basic ' + credentials,
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: params.toString()
        });
        
        const responseText = await response.text();
        
        if (!response.ok) {
          console.error('❌ Mailgun error:', response.status, responseText);
          return new Response(JSON.stringify({
            success: false,
            status: response.status,
            error: responseText,
            debug: {
              url: API_URL,
              authLength: credentials.length
            }
          }), {
            status: response.status,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        
        console.log('✅ Success:', responseText);
        return new Response(JSON.stringify({
          success: true,
          message: 'Email sent!',
          response: JSON.parse(responseText),
          debug: {
            url: API_URL,
            authLength: credentials.length
          }
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
        
      } catch (error) {
        console.error('❌ Exception:', error);
        return new Response(JSON.stringify({
          success: false,
          error: error.message
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
    
    // Health check
    if (url.pathname === '/health') {
      return new Response(JSON.stringify({
        status: 'ok',
        worker: 'mailgun-simple-test'
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response('Not Found - Try /test-email or /health', { status: 404 });
  }
};
