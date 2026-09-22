/**
 * Check KV Store for Pending Requests
 * Lists all keys in the REPORT_QUEUE_KV namespace
 */

// This script requires wrangler CLI to be installed and authenticated
// Install: npm install -g wrangler
// Login: wrangler login

const { execSync } = require('child_process');

try {
  console.log('🔍 Checking Cloudflare KV Store...\n');
  
  // List all KV namespaces first
  console.log('📋 KV Namespaces:');
  const namespaces = execSync('wrangler kv:namespace list', { encoding: 'utf8' });
  console.log(namespaces);
  
  // Find the REPORT_QUEUE_KV namespace ID
  const nsMatch = namespaces.match(/"id"\s*:\s*"([a-f0-9]+)"/);
  if (!nsMatch) {
    console.log('❌ Could not find KV namespace ID. Make sure wrangler is configured.');
    process.exit(1);
  }
  
  const namespaceId = nsMatch[1];
  console.log(`\n🔑 Found namespace ID: ${namespaceId}`);
  
  // List all keys
  console.log('\n📦 Keys in KV store:');
  const keys = execSync(`wrangler kv:key list --namespace-id ${namespaceId}`, { encoding: 'utf8' });
  console.log(keys);
  
  if (keys.trim() === '[]' || keys.includes('No keys found')) {
    console.log('ℹ️ KV store is empty - no pending requests');
  } else {
    console.log('✅ Found requests in queue!');
  }
  
} catch (error) {
  console.error('❌ Error:', error.message);
  console.error('\n💡 Make sure wrangler is installed and authenticated:');
  console.error('   npm install -g wrangler');
  console.error('   wrangler login');
}
