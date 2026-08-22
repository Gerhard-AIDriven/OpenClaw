/**
 * Push Reports to GitHub for Cloudflare Pages Deployment
 * 
 * This script:
 * 1. Copies generated HTML reports to aidriven-website/reports/html/
 * 2. Commits changes with descriptive message
 * 3. Pushes to GitHub
 * 4. Waits for Cloudflare Pages deployment (~60 seconds)
 * 5. Returns the live URL
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

// Configuration
const WORKSPACE = path.join(__dirname, '..');
const WEBSITE_DIR = path.join(WORKSPACE, 'aidriven-website');
const REPORTS_HTML_DIR = path.join(WEBSITE_DIR, 'reports', 'html');
const GIT_REMOTE = process.env.GIT_REMOTE || 'origin';
const GIT_BRANCH = process.env.GIT_BRANCH || 'main';

/**
 * Logging helper
 */
function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';
  console.log(`[${timestamp}] ${prefix} ${message}`);
}

/**
 * Sleep helper
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Copy report file to website directory
 */
async function copyReportToWebsite(sourcePath, requestId) {
  log(`Copying report to website directory...`);
  
  // Ensure target directory exists
  if (!fs.existsSync(REPORTS_HTML_DIR)) {
    fs.mkdirSync(REPORTS_HTML_DIR, { recursive: true });
    log(`Created directory: ${REPORTS_HTML_DIR}`);
  }
  
  const targetPath = path.join(REPORTS_HTML_DIR, `${requestId}.html`);
  fs.copyFileSync(sourcePath, targetPath);
  
  log(`Copied to: ${targetPath}`);
  return targetPath;
}

/**
 * Commit and push to GitHub
 */
async function commitAndPush(requestId) {
  log(`Committing changes to Git...`);
  
  try {
    // Check git status
    await execAsync('git status', { cwd: WEBSITE_DIR });
    
    // Add changed files
    await execAsync(`git add reports/html/${requestId}.html`, { cwd: WEBSITE_DIR });
    
    // Check if there are changes to commit
    const statusResult = await execAsync('git status --porcelain', { cwd: WEBSITE_DIR });
    
    if (!statusResult.stdout.trim()) {
      log('No changes to commit (file already exists with same content)', 'warn');
      return;
    }
    
    // Commit
    const commitMessage = `📊 Add property report: ${requestId}`;
    await execAsync(`git commit -m "${commitMessage}"`, { cwd: WEBSITE_DIR });
    log(`Committed: ${commitMessage}`);
    
    // Push
    log(`Pushing to ${GIT_REMOTE}/${GIT_BRANCH}...`);
    await execAsync(`git push ${GIT_REMOTE} ${GIT_BRANCH}`, { cwd: WEBSITE_DIR });
    log(`Pushed to GitHub successfully!`, 'success');
    
  } catch (error) {
    if (error.message.includes('nothing to commit')) {
      log('Nothing to commit (no changes)', 'warn');
    } else {
      throw error;
    }
  }
}

/**
 * Wait for Cloudflare Pages deployment
 */
async function waitForDeployment(requestId, maxWaitSeconds = 90) {
  log(`Waiting for Cloudflare Pages deployment... (max ${maxWaitSeconds}s)`);
  
  const startTime = Date.now();
  const checkInterval = 5000; // Check every 5 seconds
  
  while (Date.now() - startTime < maxWaitSeconds * 1000) {
    await sleep(checkInterval);
    const elapsed = Math.round((Date.now() - startTime) / 1000);
    log(`Deployment in progress... (${elapsed}s elapsed)`, 'info');
    
    // In production, we would check Cloudflare API for deployment status
    // For now, we just wait a reasonable amount of time
    if (elapsed >= 60) {
      log(`Deployment should be complete!`, 'success');
      break;
    }
  }
  
  // Return the expected live URL
  const liveUrl = `https://aidriven.biz/reports/html/${requestId}.html`;
  log(`Live URL: ${liveUrl}`, 'success');
  return liveUrl;
}

/**
 * Main function - Push report to GitHub and wait for deployment
 */
async function pushReport(sourcePath, requestId) {
  try {
    log(`🚀 Starting GitHub push for report: ${requestId}`);
    
    // Step 1: Copy to website directory
    await copyReportToWebsite(sourcePath, requestId);
    
    // Step 2: Commit and push
    await commitAndPush(requestId);
    
    // Step 3: Wait for deployment
    const liveUrl = await waitForDeployment(requestId);
    
    log(`✅ Report live at: ${liveUrl}`, 'success');
    
    return {
      success: true,
      liveUrl,
      requestId
    };
    
  } catch (error) {
    log(`Failed to push report: ${error.message}`, 'error');
    return {
      success: false,
      error: error.message,
      requestId
    };
  }
}

// Export for use in other scripts
module.exports = { pushReport, copyReportToWebsite, commitAndPush, waitForDeployment };

// If run directly from command line
if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length !== 2) {
    console.error('Usage: node push-to-github.js <source-path> <request-id>');
    process.exit(1);
  }
  
  const [sourcePath, requestId] = args;
  pushReport(sourcePath, requestId)
    .then(result => {
      if (result.success) {
        console.log('\n✅ SUCCESS:', result.liveUrl);
        process.exit(0);
      } else {
        console.error('\n❌ FAILED:', result.error);
        process.exit(1);
      }
    })
    .catch(err => {
      console.error('\n❌ ERROR:', err.message);
      process.exit(1);
    });
}
