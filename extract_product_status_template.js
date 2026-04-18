/**
 * SPAR Sigma Product Status Analysis Template
 * 
 * Purpose: Extract last sales month for all products in a SPAR Sigma Excel export
 * Works with: Any department following the standard 5-column monthly format
 * Date Format: D/MM/YY (e.g., 01/02/26 = 1st February 2026)
 * 
 * Usage:
 *   node extract_product_status_template.js <input_file> <output_file> [report_date]
 * 
 * Example:
 *   node extract_product_status_template.js "Spar/Data Extracts/gws produce.xls" "produce_status.json" "2026-04-18"
 * 
 * CONFIGURATION VARIABLES (customize per department):
 */

const XLSX = require('xlsx');
const fs = require('fs');

// ============================================================================
// CONFIGURATION - CUSTOMIZE THESE FOR YOUR DEPARTMENT
// ============================================================================

const CONFIG = {
  // File path (from command line or hardcoded)
  inputFile: process.argv[2] || 'Spar/Data Extracts/gws butchery new.xls',
  
  // Output file path
  outputFile: process.argv[3] || 'product_status_analysis.json',
  
  // Reference date for calculating "months ago" (ISO format: YYYY-MM-DD)
  referenceDate: process.argv[4] || '2026-04-18',
  
  // Department name (for reporting)
  departmentName: 'Butchery',
  
  // Data analysis period
  analysisStart: '1 March 2022',
  analysisEnd: '1 April 2026',
  
  // Status thresholds (months ago)
  statusThresholds: {
    active: 2,      // 0-2 months = ACTIVE
    recent: 4,      // 3-4 months = RECENT
    stale: 12,      // 5-12 months = STALE
    deadStock: null // 12+ months = DEAD STOCK
  }
};

// ============================================================================
// MAIN EXTRACTION LOGIC (do not modify unless extending functionality)
// ============================================================================

console.log(`\n📊 SPAR Sigma Product Status Extraction\n`);
console.log(`File: ${CONFIG.inputFile}`);
console.log(`Department: ${CONFIG.departmentName}`);
console.log(`Reference Date: ${CONFIG.referenceDate}\n`);

// Read Excel file
const wb = XLSX.readFile(CONFIG.inputFile);
const ws = wb.Sheets['Sheet1'];
const range = XLSX.utils.decode_range(ws['!ref']);

console.log(`Sheet dimensions: ${range.e.r + 1} rows × ${range.e.c + 1} columns`);

// Find all month columns by scanning row 0 for date headers (D/MM/YY format)
const monthLocations = [];

for (let c = 0; c <= range.e.c; c++) {
  const cellRef = XLSX.utils.encode_cell({r: 0, c});
  const cell = ws[cellRef];
  const value = cell ? cell.v?.toString() : '';
  
  if (value.match(/^\d{1,2}\/\d{1,2}\/\d{2}$/)) {
    monthLocations.push({
      month: value,
      monthCol: c,
      salesQtyCol: c + 1,  // Sales Qty is 2nd column in 5-column monthly block
      colLetter: XLSX.utils.encode_col(c + 1)
    });
  }
}

console.log(`Found ${monthLocations.length} months with headers`);
console.log(`Period: ${monthLocations[0]?.month} to ${monthLocations[monthLocations.length - 1]?.month}\n`);

const products = [];

// Extract product data (rows 2 onwards, row 0 = months, row 1 = column headers)
for (let r = 2; r <= range.e.r; r++) {
  const code = ws[XLSX.utils.encode_cell({r, c: 0})]?.v;
  const desc = ws[XLSX.utils.encode_cell({r, c: 1})]?.v;
  
  if (!code || !desc) continue;
  
  // Skip summary/total rows
  if (desc.toString().includes('Totals') || desc.toString().includes('Total (Overall)')) {
    continue;
  }
  
  // Find LAST month with sales > 0 (scan LEFT-TO-RIGHT to get truly last month)
  let lastMonth = null;
  let lastSalesQty = 0;
  
  for (let i = 0; i < monthLocations.length; i++) {
    const monthInfo = monthLocations[i];
    const cellRef = XLSX.utils.encode_cell({r, c: monthInfo.salesQtyCol});
    const cell = ws[cellRef];
    
    let val = cell?.v || 0;
    
    // Handle formatted numbers with spaces
    if (typeof val === 'string') {
      val = parseFloat(val.replace(/\s/g, ''));
    }
    val = parseFloat(val) || 0;
    
    // Keep updating lastMonth if we find any data (to get the LAST one)
    if (val > 0) {
      lastMonth = monthInfo.month;
      lastSalesQty = val;
    }
  }
  
  // Convert to readable format with D/MM/YY date parsing
  let lastMonthReadable = 'No sales recorded';
  let status = 'DEAD STOCK';
  let monthsAgo = 999;
  
  if (lastMonth) {
    // Parse D/MM/YY format: e.g., "01/02/26" = day 01, month 02, year 26
    const parts = lastMonth.split('/');
    let d = parseInt(parts[0]);  // Day
    let m = parseInt(parts[1]);  // Month
    let y = parseInt(parts[2]);  // Year
    
    const fullYear = 2000 + y;
    const date = new Date(fullYear, m - 1, d);  // Month is 0-indexed in JS
    lastMonthReadable = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
    
    // Calculate months elapsed from reference date
    const refDate = new Date(CONFIG.referenceDate);
    const diffTime = refDate - date;
    monthsAgo = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 30.44));
    
    // Determine status
    if (monthsAgo <= CONFIG.statusThresholds.active) {
      status = 'ACTIVE';
    } else if (monthsAgo <= CONFIG.statusThresholds.recent) {
      status = 'RECENT';
    } else if (monthsAgo <= CONFIG.statusThresholds.stale) {
      status = 'STALE';
    } else {
      status = 'DEAD STOCK';
    }
  }
  
  products.push({
    code: code.toString().trim(),
    description: desc.toString().trim(),
    lastMonth: lastMonth,
    lastMonthReadable: lastMonthReadable,
    lastSalesQty: lastSalesQty,
    status: status,
    monthsAgo: monthsAgo
  });
}

// Sort by status (ACTIVE first, DEAD STOCK last), then by code
const statusOrder = { 'ACTIVE': 0, 'RECENT': 1, 'STALE': 2, 'DEAD STOCK': 3 };
products.sort((a, b) => {
  const cmp = statusOrder[a.status] - statusOrder[b.status];
  return cmp === 0 ? parseInt(a.code) - parseInt(b.code) : cmp;
});

// Calculate summary
const output = {
  metadata: {
    timestamp: new Date().toISOString(),
    dataSource: `SPAR Sigma System - ${CONFIG.departmentName}`,
    period: `${CONFIG.analysisStart} - ${CONFIG.analysisEnd}`,
    reportDate: CONFIG.referenceDate,
    fileName: CONFIG.inputFile,
    dateFormat: 'D/MM/YY (e.g., 01/02/26 = 1st February 2026)',
    monthsDetected: monthLocations.length
  },
  statusThresholds: CONFIG.statusThresholds,
  statusSummary: {
    ACTIVE: products.filter(p => p.status === 'ACTIVE').length,
    RECENT: products.filter(p => p.status === 'RECENT').length,
    STALE: products.filter(p => p.status === 'STALE').length,
    'DEAD STOCK': products.filter(p => p.status === 'DEAD STOCK').length,
    total: products.length
  },
  products: products
};

// Save to JSON
fs.writeFileSync(CONFIG.outputFile, JSON.stringify(output, null, 2));

// Print summary
console.log(`✓ Successfully extracted ${products.length} products\n`);
console.log('Status Summary:');
console.log(`  ACTIVE (0-${CONFIG.statusThresholds.active} months):        ${output.statusSummary.ACTIVE}`);
console.log(`  RECENT (${CONFIG.statusThresholds.active + 1}-${CONFIG.statusThresholds.recent} months):       ${output.statusSummary.RECENT}`);
console.log(`  STALE (${CONFIG.statusThresholds.recent + 1}-${CONFIG.statusThresholds.stale} months):         ${output.statusSummary.STALE}`);
console.log(`  DEAD STOCK (12+ months): ${output.statusSummary['DEAD STOCK']}`);

console.log(`\n✓ Saved to: ${CONFIG.outputFile}`);

// Print sample of each status
console.log('\n--- Sample ACTIVE Products (First 5) ---');
const activeSample = products.filter(p => p.status === 'ACTIVE').slice(0, 5);
if (activeSample.length === 0) {
  console.log('  (None)');
} else {
  activeSample.forEach(p => {
    console.log(`  ${p.code.padEnd(8)} | ${p.description.substring(0, 35).padEnd(35)} | ${p.lastMonthReadable.padEnd(15)} | Qty: ${Math.round(p.lastSalesQty)}`);
  });
}

console.log('\n--- Sample DEAD STOCK Products (First 5) ---');
const deadSample = products.filter(p => p.status === 'DEAD STOCK').slice(0, 5);
if (deadSample.length === 0) {
  console.log('  (None)');
} else {
  deadSample.forEach(p => {
    console.log(`  ${p.code.padEnd(8)} | ${p.description.substring(0, 35).padEnd(35)} | ${p.lastMonthReadable.padEnd(15)} | Qty: ${Math.round(p.lastSalesQty)}`);
  });
}

console.log('\n');
