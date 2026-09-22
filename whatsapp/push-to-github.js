/**
 * Push Reports to GitHub for Cloudflare Pages Deployment
 * 
 * CRITICAL FIX: Verifies report is actually accessible on aidriven.biz BEFORE returning success
 * Prevents broken links in customer emails
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
 * Wait for Cloudflare Pages deployment AND VERIFY file is accessible
 */
async function waitForDeployment(requestId, maxWaitSeconds = 90) {
  log(`Waiting for Cloudflare Pages deployment... (max ${maxWaitSeconds}s)`);
  
  const liveUrl = `https://aidriven.biz/reports/html/${requestId}.html`;
  const startTime = Date.now();
  const checkInterval = 3000; // Check every 3 seconds
  const maxAttempts = Math.floor(maxWaitSeconds * 1000 / checkInterval);
  
  let attempt = 0;
  
  while (attempt < maxAttempts) {
    attempt++;
    const elapsed = Math.round((Date.now() - startTime) / 1000);
    
    // First, wait a bit for Cloudflare to start deployment
    await sleep(checkInterval);
    
    // Start checking after 10 seconds (deployment needs to begin)
    if (elapsed >= 10) {
      log(`Checking deployment... (${elapsed}s elapsed, attempt ${attempt}/${maxAttempts})`, 'info');
      
      try {
        // Use HEAD request to check if file is accessible
        const response = await fetch(liveUrl, { method: 'HEAD' });
        
        if (response.ok) {
          log(`✅ Deployment verified! Status: ${response.status}`, 'success');
          return { success: true, liveUrl, attempts: attempt, elapsed };
        } else {
          log(`⚠️ Status ${response.status}, waiting...`, 'warn');
        }
        
      } catch (fetchError) {
        log(`⚠️ Fetch error: ${fetchError.message}, waiting...`, 'warn');
      }
    }
  }
  
  // Verification failed after max attempts
  log(`❌ Verification failed after ${maxAttempts} attempts (${maxWaitSeconds}s)`, 'error');
  return {
    success: false,
    error: 'Deployment verification timeout - file not accessible on aidriven.biz',
    liveUrl,
    attempts: maxAttempts,
    elapsed: maxWaitSeconds
  };
}

/**
 * Rollback git commit if verification fails
 */
async function rollbackCommit() {
  log(`Rolling back git commit...`);
  
  try {
    await execAsync('git reset --hard HEAD~1', { cwd: WEBSITE_DIR });
    log(`Commit rolled back successfully`, 'warn');
    return true;
  } catch (error) {
    log(`Rollback failed: ${error.message}`, 'error');
    return false;
  }
}

/**
 * Main function - Push report to GitHub and VERIFY deployment
 */
async function pushReport(sourcePath, requestId) {
  try {
    log(`🚀 Starting GitHub push for report: ${requestId}`);
    
    // Step 1: Copy to website directory
    await copyReportToWebsite(sourcePath, requestId);
    
    // Step 2: Commit and push
    await commitAndPush(requestId);
    
    // Step 3: Wait for deployment AND VERIFY
    const deploymentResult = await waitForDeployment(requestId, 90);
    
    if (!deploymentResult.success) {
      log(`Deployment verification FAILED`, 'error');
      
      // Rollback the commit since verification failed
      await rollbackCommit();
      
      return {
        success: false,
        error: deploymentResult.error,
        requestId,
        attempts: deploymentResult.attempts
      };
    }
    
    log(`✅ Report verified live at: ${deploymentResult.liveUrl}`, 'success');
    
    return {
      success: true,
      liveUrl: deploymentResult.liveUrl,
      requestId,
      attempts: deploymentResult.attempts,
      elapsed: deploymentResult.elapsed
    };
    
  } catch (error) {
    log(`Failed to push report: ${error.message}`, 'error');
    
    // Try to rollback
    await rollbackCommit();
    
    return {
      success: false,
      error: error.message,
      requestId
    };
  }
}

// Export for use in other scripts
module.exports = { pushReport, copyReportToWebsite, commitAndPush, waitForDeployment, rollbackCommit };

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
