/**
 * Test Due Diligence Report Generation
 * 
 * Simulates processing a WhatsApp request without actual WhatsApp integration
 * Run this to verify the report generator works end-to-end
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

// Configuration
const WORKSPACE_ROOT = 'C:\\Users\\gstim\\.openclaw\\workspace';
const DUE_DILIGENCE_DIR = path.join(WORKSPACE_ROOT, 'due-diligence-mvp');

// Logging
function log(level, message, data = null) {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
  
  if (data) {
    console.log(`${prefix} ${message}`, JSON.stringify(data, null, 2));
  } else {
    console.log(`${prefix} ${message}`);
  }
}

/**
 * Test report generation for a sample property
 */
async function testReportGeneration() {
  log('info', '=== Testing Due Diligence Report Generation ===\n');
  
  // Test address (from your validated test cases)
  const testAddress = '18 Ferguson Avenue, Napier';
  const testRequestId = 'test-' + Date.now();
  
  log('info', `Test Request ID: ${testRequestId}`);
  log('info', `Test Address: ${testAddress}\n`);
  
  try {
    // Check if the report generator script exists
    const scriptPath = path.join(DUE_DILIGENCE_DIR, 'generate_report_with_rates.py');
    
    if (!fs.existsSync(scriptPath)) {
      log('error', `Report generator not found at: ${scriptPath}`);
      log('info', 'Available scripts in due-diligence-mvp:');
      const files = fs.readdirSync(DUE_DILIGENCE_DIR);
      files.filter(f => f.endsWith('.py')).forEach(f => console.log(`  - ${f}`));
      return;
    }
    
    log('info', `Found report generator: ${scriptPath}\n`);
    
    // Check reports directory
    const reportsDir = path.join(DUE_DILIGENCE_DIR, 'reports');
    if (!fs.existsSync(reportsDir)) {
      log('info', 'Creating reports directory...');
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    
    const outputPath = path.join(reportsDir, `test-${testRequestId}.html`);
    log('info', `Output will be: ${outputPath}\n`);
    
    // Run the report generator
    log('info', 'Running report generator...');
    log('info', `Command: python "${scriptPath}" --address "${testAddress}" --output "${outputPath}"\n`);
    
    const { stdout, stderr } = await execPromise(
      `python "${scriptPath}" --address "${testAddress}" --output "${outputPath}"`,
      {
        cwd: DUE_DILIGENCE_DIR,
        timeout: 120000 // 2 minute timeout
      }
    );
    
    if (stdout) {
      log('info', 'Script output:', { output: stdout });
    }
    
    if (stderr) {
      log('warn', 'Script warnings/errors:', { errors: stderr });
    }
    
    // Check if output file was created
    if (fs.existsSync(outputPath)) {
      const stats = fs.statSync(outputPath);
      log('info', '✅ SUCCESS! Report generated:', {
        path: outputPath,
        size: `${(stats.size / 1024).toFixed(2)} KB`,
        created: stats.birthtime
      });
      
      // Show first few lines of the report
      const content = fs.readFileSync(outputPath, 'utf8');
      const preview = content.substring(0, 500).replace(/\n/g, '\n  ');
      log('info', 'Report preview:', { preview: preview + '...' });
      
      log('info', `\n🎉 Test PASSED - Report generation is working!`);
      log('info', `Open in browser: file://${outputPath}`);
      
    } else {
      log('error', '❌ FAILED - Output file not created');
      log('info', `Expected at: ${outputPath}`);
    }
    
  } catch (error) {
    log('error', `Test failed: ${error.message}`);
    
    if (error.code === 'ENOENT') {
      log('info', 'Python or script not found. Make sure:');
      log('info', '  1. Python is installed and in PATH');
      log('info', '  2. All required dependencies are installed');
      log('info', '  3. Script path is correct');
    }
    
    if (error.stderr) {
      log('error', 'Script error output:', { error: error.stderr });
    }
  }
}

// Run the test
testReportGeneration();
