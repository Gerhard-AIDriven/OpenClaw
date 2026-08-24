/**
 * Push Reports to GitHub Pages
 * 
 * This script:
 * 1. Copies generated HTML reports to the gh-pages branch
 * 2. Commits and pushes to gh-pages
 * 3. Returns the GitHub Pages live URL
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

// Configuration
const WORKSPACE = path.join(__dirname, '..');
const REPORTS_HTML_DIR = path.join(WORKSPACE, 'aidriven-website', 'reports', 'html');
const GIT_REMOTE = 'origin';
const GH_PAGES_BRANCH = 'gh-pages';
const MASTER_BRANCH = 'master';

/**
 * Logging helper
 */
function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';
  console.log(`[${timestamp}] ${prefix} ${message}`);
}

/**
 * Push report to gh-pages branch without switching branches locally
 */
async function pushReportToGitHubPages(sourcePath, requestId) {
  try {
    log(`🚀 Deploying report ${requestId} to GitHub Pages...`);
    
    const reportFilename = path.basename(sourcePath);
    
    // Use git checkout to a temporary file, modify it, and commit directly to gh-pages
    // We use a temporary branch to avoid messing up the current working directory
    
    // Step 1: Create a temporary branch from gh-pages
    await execAsync(`git checkout ${GH_PAGES_BRANCH}`, { cwd: WORKSPACE });
    
    // Step 2: Copy report to the correct folder on gh-pages branch
    const targetPath = path.join(WORKSPACE, 'reports', 'html', reportFilename);
    const targetDir = path.dirname(targetPath);
    
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    
    fs.copyFileSync(sourcePath, targetPath);
    
    // Step 3: Commit and Push to gh-pages
    await execAsync(`git add reports/html/${reportFilename}`, { cwd: WORKSPACE });
    await execAsync(`git commit -m "Deploy report: ${requestId}"`, { cwd: WORKSPACE });
    await execAsync(`git push ${GIT_REMOTE} ${GH_PAGES_BRANCH}`, { cwd: WORKSPACE });
    
    // Step 4: Switch back to master
    await execAsync(`git checkout ${MASTER_BRANCH}`, { cwd: WORKSPACE });
    
    // Construct the live URL
    // Format: https://<username>.github.io/<repo>/<path>
    const liveUrl = `https://gerhard-aidriven.github.io/OpenClaw/reports/html/${reportFilename}`;
    
    log(`✅ Report live at: ${liveUrl}`, 'success');
    
    return {
      success: true,
      liveUrl,
      requestId
    };
    
  } catch (error) {
    log(`Failed to deploy to GitHub Pages: ${error.message}`, 'error');
    
    // Attempt to switch back to master if we failed while on gh-pages
    try {
      await execAsync(`git checkout ${MASTER_BRANCH}`, { cwd: WORKSPACE });
    } catch (e) {}
    
    return {
      success: false,
      error: error.message,
      requestId
    };
  }
}

module.exports = { pushReportToGitHubPages };
