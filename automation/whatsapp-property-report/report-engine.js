#!/usr/bin/env node

/**
 * AI Driven - Unified Property Report Generation Engine
 * Shared module for both Web Form and WhatsApp automation
 * 
 * Usage: const { generatePropertyReport } = require('./report-engine');
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Import data fetchers
const { fetchLinZData, parseAddress } = require('./linz-fetcher');
const { scrapeCouncilGIS } = require('./council-scraper');
const { fetchOneRoofValuation } = require('./oneroof-fetcher');
const generateReportHTML = require('../../whatsapp/report-template-v2'); // Default export

// Configuration
const CONFIG = {
  reportsDir: path.join(__dirname, '../../aidriven-website/reports'),
  gitWaitTime: 30000, // 30 seconds for Cloudflare deployment
  linzApiKeyFile: path.join(__dirname, '../../due-diligence-mvp/config/linz-api-key.txt')
};

/**
 * Generate unique order ID
 * Format: DD-YYMMDD-XXX
 */
function generateOrderId() {
  const date = new Date();
  const year = date.getFullYear().toString().substr(-2);
  const month = ('0' + (date.getMonth() + 1)).slice(-2);
  const day = ('0' + date.getDate()).slice(-2);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `DD-${year}${month}${day}-${random}`;
}

/**
 * Read LINZ API key from file
 */
function getLinZApiKey() {
  try {
    if (process.env.LINZ_API_KEY) {
      return process.env.LINZ_API_KEY.trim();
    }
    return fs.readFileSync(CONFIG.linzApiKeyFile, 'utf8').trim();
  } catch (error) {
    console.warn('⚠️ LINZ API key not found - using demo mode');
    return null;
  }
}

/**
 * Generate filename from address
 */
function generateFilename(address, packageType) {
  const sanitized = address
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '_')
    .trim();
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0] + '_' + 
                   new Date().toTimeString().split(' ')[0].replace(/:/g, '-');
  
  return `${sanitized}_${packageType}_${timestamp}.html`;
}

/**
 * Save report HTML to file
 */
function saveReport(html, filename) {
  // Ensure reports directory exists
  if (!fs.existsSync(CONFIG.reportsDir)) {
    fs.mkdirSync(CONFIG.reportsDir, { recursive: true });
    console.log(`📁 Created reports directory: ${CONFIG.reportsDir}`);
  }
  
  const filepath = path.join(CONFIG.reportsDir, filename);
  fs.writeFileSync(filepath, html, 'utf8');
  console.log(`✅ Report saved: ${filepath}`);
  
  return filename;
}

/**
 * Commit and push report to Git
 */
async function commitToGit(filename) {
  // Workspace root is parent of automation folder
  const workspaceRoot = path.join(__dirname, '../..');
  
  console.log(`   [DEBUG] __dirname: ${__dirname}`);
  console.log(`   [DEBUG] workspaceRoot: ${workspaceRoot}`);
  
  try {
    console.log('🔄 Committing to Git...');
    
    // Verify we're in the right place
    const reportsPath = path.join(workspaceRoot, 'aidriven-website', 'reports', filename);
    console.log(`   Expected file location: ${reportsPath}`);
    
    if (!fs.existsSync(reportsPath)) {
      throw new Error(`Report file not found at ${reportsPath}`);
    }
    
    // Change to aidriven-website directory for git operations
    const websiteRoot = path.join(workspaceRoot, 'aidriven-website');
    console.log(`   Git working dir: ${websiteRoot}`);
    
    // Add the new report file
    execSync(`git add reports/${filename}`, { cwd: websiteRoot, stdio: 'pipe' });
    
    // Commit
    const commitMsg = `Auto: Add report ${filename}`;
    execSync(`git commit -m "${commitMsg}"`, { cwd: websiteRoot, stdio: 'pipe' });
    console.log('✅ Git commit successful');
    
    // Push to GitHub
    console.log('🚀 Pushing to GitHub...');
    execSync('git push', { cwd: websiteRoot, stdio: 'pipe' });
    console.log('✅ Git push successful');
    
    return true;
    
  } catch (error) {
    console.error('❌ Git operation failed:', error.message);
    
    // Check if it's just "nothing to commit"
    if (error.message.includes('nothing to commit')) {
      console.log('⚠️ No changes to commit (file may already exist)');
      return true;
    }
    
    throw error;
  }
}

/**
 * Sleep helper
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Main report generation function
 * 
 * @param {Object} options - Report generation options
 * @param {string} options.address - Full property address
 * @param {string} options.package - Package type: 'basic', 'standard', or 'premium'
 * @param {string} options.customerName - Customer name (optional)
 * @param {string} options.requestId - WhatsApp request ID (optional)
 * @returns {Promise<Object>} Result with report URL and metadata
 */
async function generatePropertyReport(options) {
  const { address, package: packageType, customerName, requestId } = options;
  
  console.log('\n🏠 AI Driven - Property Report Generation');
  console.log('=' .repeat(60));
  console.log(`Address: ${address}`);
  console.log(`Package: ${packageType}`);
  console.log(`Customer: ${customerName || 'N/A'}`);
  console.log('=' .repeat(60));
  
  try {
    // Step 1: Parse address
    console.log('\n[1/6] Parsing address...');
    const parsedAddress = parseAddress(address);
    console.log(`  → Street: ${parsedAddress.street}`);
    console.log(`  → Suburb: ${parsedAddress.suburb}`);
    console.log(`  → City: ${parsedAddress.city}`);
    
    // Step 2: Fetch LINZ data
    console.log('\n[2/6] Fetching LINZ title data...');
    const linzApiKey = getLinZApiKey();
    const linzData = linzApiKey 
      ? await fetchLinZData(address, linzApiKey)
      : null;
    
    // Step 3: Fetch council data
    console.log('\n[3/6] Checking council hazard maps...');
    const councilData = await scrapeCouncilGIS(parsedAddress.city, null);
    
    // Step 4: Fetch valuation data (if standard/premium)
    let valuationData = {};
    if (packageType === 'standard' || packageType === 'premium') {
      console.log('\n[4/6] Fetching valuation data...');
      valuationData = await fetchOneRoofValuation(address, null);
    } else {
      console.log('\n[4/6] Skipping valuation (Basic package)');
    }
    
    // Step 5: Merge all data
    console.log('\n[5/6] Generating report HTML...');
    const reportData = {
      orderId: generateOrderId(),
      address: parsedAddress.full,
      street: parsedAddress.street,
      suburb: parsedAddress.suburb,
      city: parsedAddress.city,
      packageType: packageType,
      customerName: customerName || 'Customer',
      generatedAt: new Date().toLocaleString('en-NZ'),
      
      // LINZ data
      titleNumber: linzData?.titleNumber || 'HB1234/56 (Demo)',
      owners: linzData?.owners || 'Current Registered Owners',
      landArea: linzData?.landArea || '850 m²',
      legalDescription: linzData?.legalDescription || 'Lot 1 DP 12345',
      easements: linzData?.easements || 'None registered',
      
      // Council data
      floodHazard: councilData.floodHazard || 'No known hazards',
      liquefactionRisk: councilData.liquefactionRisk || 'Low',
      zoningCode: councilData.zoningCode || 'Residential',
      
      // Valuation data (may be placeholders for Basic)
      capitalValue: valuationData.capitalValue || '$685,000 (estimate)',
      landValue: valuationData.landValue || '$485,000 (estimate)',
      annualRates: valuationData.annualRates || '$2,450 p.a.',
      lastSoldPrice: valuationData.lastSoldPrice || null,
      lastSoldDate: valuationData.lastSoldDate || null,
      
      // Risk assessment
      riskRating: 2, // Default low-medium risk
      riskSummary: 'Low to medium risk profile. Standard due diligence recommended.'
    };
    
    // Generate HTML using shared template
    const html = generateReportHTML(reportData);
    
    // Generate filename and save
    const filename = generateFilename(parsedAddress.street, packageType);
    saveReport(html, filename);
    
    // Step 6: Git commit & push
    console.log('\n[6/6] Deploying to Cloudflare Pages...');
    await commitToGit(filename);
    
    // Wait for Cloudflare deployment
    console.log(`⏳ Waiting ${CONFIG.gitWaitTime / 1000}s for Cloudflare deployment...`);
    await sleep(CONFIG.gitWaitTime);
    
    // Build report URL
    const reportUrl = `https://aidriven.biz/reports/${filename}`;
    
    console.log('\n✅ Report generation complete!');
    console.log(`📄 Report URL: ${reportUrl}`);
    console.log(`🆔 Order ID: ${reportData.orderId}`);
    
    return {
      success: true,
      orderId: reportData.orderId,
      reportUrl: reportUrl,
      filename: filename,
      packageType: packageType,
      address: address,
      generatedAt: reportData.generatedAt
    };
    
  } catch (error) {
    console.error('\n❌ Report generation failed:', error.message);
    console.error(error.stack);
    
    return {
      success: false,
      error: error.message,
      address: address,
      packageType: packageType
    };
  }
}

module.exports = { 
  generatePropertyReport, 
  generateOrderId,
  parseAddress,
  CONFIG 
};
