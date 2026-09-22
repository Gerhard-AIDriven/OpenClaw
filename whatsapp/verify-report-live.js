/**
 * Verify report is live on Cloudflare Pages
 */

async function verifyLive() {
  const requestId = 'COMPLETE_TEST_1787584207949';
  const liveUrl = `https://aidriven.biz/reports/html/${requestId}.html`;
  
  console.log('🔍 Checking if report is live...');
  console.log(`URL: ${liveUrl}\n`);
  
  const maxAttempts = 20;
  const checkInterval = 3000;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await fetch(liveUrl, { method: 'GET' });
      
      if (response.ok) {
        const contentType = response.headers.get('content-type');
        console.log(`✅ SUCCESS! Report is LIVE!`);
        console.log(`   Status: ${response.status}`);
        console.log(`   Content-Type: ${contentType}`);
        console.log(`\n🌐 Open in browser: ${liveUrl}`);
        return true;
      } else {
        console.log(`⚠️ Attempt ${attempt}/${maxAttempts}: Status ${response.status}, waiting...`);
      }
    } catch (error) {
      console.log(`⚠️ Attempt ${attempt}/${maxAttempts}: ${error.message}, waiting...`);
    }
    
    await new Promise(resolve => setTimeout(resolve, checkInterval));
  }
  
  console.log('\n❌ Report not accessible after maximum attempts');
  console.log('💡 Cloudflare Pages deployment may still be in progress');
  console.log('   Check: https://dash.cloudflare.com/?to=/:account/pages/view/aidriven-website/deployments');
  return false;
}

verifyLive();
