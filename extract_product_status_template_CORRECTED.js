/**
 * SPAR Sigma Product Status Analysis Template - CORRECTED MAPPING
 * 
 * Column Structure (VERIFIED):
 * Row 0: Month headers (D/MM/YY format) starting at column H, every 4th column
 * Row 1: Column headers
 * Rows 2+: Product data
 * 
 * Column Layout:
 * A: Product Code
 * B: Product Description  
 * C: Department Number
 * D-G: Summary columns (Sales VAT, Qty, GP Ratio%, GP%)
 * 
 * H-K: March 2022 data
 *   H: Sales incl VAT
 *   I: Sales Quantity
 *   J: GP Ratio (%) [not used]
 *   K: GP %
 * 
 * L-O: April 2022 data (same structure)
 * P-S: May 2022 data (same structure)
 * ... continues every 4 columns until April 2026
 * 
 * Usage:
 *   node extract_product_status_template_CORRECTED.js <input_file> <output_file> [report_date] [department_name]
 */

const XLSX = require('xlsx');
const fs = require('fs');

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  inputFile: process.argv[2] || 'Spar/Data Extracts/gws groceries.xls',
  outputFile: process.argv[3] || 'product_status.json',
  reportDate: process.argv[4] || '2026-04-19',
  departmentName: process.argv[5] || 'Groceries',
  
  // Status thresholds
  statusThresholds: {
    active: 2,      // 0-2 months
    recent: 4,      // 3-4 months
    stale: 12,      // 5-12 months
    deadStock: null // 12+ months
  }
};

console.log(`\n📊 SPAR Sigma - Product Dormancy Analysis (CORRECTED MAPPING)`);
console.log(`File: ${CONFIG.inputFile}`);
console.log(`Department: ${CONFIG.departmentName}\n`);

// Read Excel
const wb = XLSX.readFile(CONFIG.inputFile);
const ws = wb.Sheets['Sheet1'];
const range = XLSX.utils.decode_range(ws['!ref']);

console.log(`Dimensions: ${range.e.r + 1} rows × ${range.e.c + 1} columns`);

// ============================================================================
// FIND MONTH COLUMNS - start at H (col 7), step every 4 columns
// ============================================================================

const monthLocations = [];

// Months are in row 0, starting at column H (index 7), every 4th column
for (let c = 7; c <= range.e.c; c += 4) {
  const cellRef = XLSX.utils.encode_cell({r: 0, c});
  const cell = ws[cellRef];
  const monthHeader = cell ? cell.v?.toString() : '';
  
  // Verify it's a date in D/MM/YY format
  if (monthHeader.match(/^\d{1,2}\/\d{1,2}\/\d{2}$/)) {
    monthLocations.push({
      month: monthHeader,
      monthCol: c,
      salesVATCol: c,       // Column N
      qtyCol: c + 1,        // Column N+1
      gpRatioCol: c + 2,    // Column N+2 (not used)
      gpPercentCol: c + 3   // Column N+3
    });
  }
}

console.log(`✓ Found ${monthLocations.length} months\n`);

if (monthLocations.length === 0) {
  console.error('ERROR: No month columns found! Check column H and every 4th column after.');
  process.exit(1);
}

console.log(`Date range: ${monthLocations[0].month} to ${monthLocations[monthLocations.length - 1].month}\n`);

// ============================================================================
// EXTRACT PRODUCTS
// ============================================================================

const products = [];

for (let r = 2; r <= range.e.r; r++) {
  const code = ws[XLSX.utils.encode_cell({r, c: 0})]?.v;
  const desc = ws[XLSX.utils.encode_cell({r, c: 1})]?.v;
  
  if (!code || !desc) continue;
  if (desc.toString().includes('Totals') || desc.toString().includes('Total (Overall)')) continue;
  
  // Find LAST month with sales > 0
  let lastMonth = null;
  let lastSalesQty = 0;
  
  for (let i = 0; i < monthLocations.length; i++) {
    const cellRef = XLSX.utils.encode_cell({r, c: monthLocations[i].qtyCol});
    const cell = ws[cellRef];
    
    let val = cell?.v || 0;
    if (typeof val === 'string') val = parseFloat(val.replace(/\s/g, ''));
    val = parseFloat(val) || 0;
    
    // Keep updating to find LAST month with sales
    if (val > 0) {
      lastMonth = monthLocations[i].month;
      lastSalesQty = val;
    }
  }
  
  // Convert date and classify status
  let lastMonthReadable = 'No sales recorded';
  let status = 'DEAD STOCK';
  let monthsAgo = 999;
  
  if (lastMonth) {
    const parts = lastMonth.split('/');
    let d = parseInt(parts[0]);
    let m = parseInt(parts[1]);
    let y = parseInt(parts[2]);
    
    const fullYear = 2000 + y;
    const date = new Date(fullYear, m - 1, d);
    lastMonthReadable = date.toLocaleDateString('en-US', {year: 'numeric', month: 'long'});
    
    const refDate = new Date(CONFIG.reportDate);
    const diffTime = refDate - date;
    monthsAgo = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 30.44));
    
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
    lastMonth,
    lastMonthReadable,
    lastSalesQty,
    status,
    monthsAgo
  });
}

// Sort by status
const statusOrder = {'ACTIVE': 0, 'RECENT': 1, 'STALE': 2, 'DEAD STOCK': 3};
products.sort((a, b) => {
  const cmp = statusOrder[a.status] - statusOrder[b.status];
  return cmp === 0 ? parseInt(a.code) - parseInt(b.code) : cmp;
});

// Summary
const summary = {
  ACTIVE: products.filter(p => p.status === 'ACTIVE').length,
  RECENT: products.filter(p => p.status === 'RECENT').length,
  STALE: products.filter(p => p.status === 'STALE').length,
  'DEAD STOCK': products.filter(p => p.status === 'DEAD STOCK').length
};

console.log(`Total products: ${products.length}\n`);
console.log('Status Summary:');
console.log(`  ACTIVE (0-2 months):     ${summary.ACTIVE} (${(summary.ACTIVE/products.length*100).toFixed(1)}%)`);
console.log(`  RECENT (3-4 months):     ${summary.RECENT} (${(summary.RECENT/products.length*100).toFixed(1)}%)`);
console.log(`  STALE (5-12 months):     ${summary.STALE} (${(summary.STALE/products.length*100).toFixed(1)}%)`);
console.log(`  DEAD STOCK (12+ months): ${summary['DEAD STOCK']} (${(summary['DEAD STOCK']/products.length*100).toFixed(1)}%)\n`);

// Save JSON
const jsonOutput = {
  timestamp: new Date().toISOString(),
  totalProducts: products.length,
  dataSource: `SPAR Sigma System - Department: ${CONFIG.departmentName}`,
  period: `${monthLocations[0].month} to ${monthLocations[monthLocations.length - 1].month}`,
  reportDate: CONFIG.reportDate,
  dateFormat: 'D/MM/YY',
  monthsDetected: monthLocations.length,
  statusSummary: summary,
  products
};

fs.writeFileSync(CONFIG.outputFile, JSON.stringify(jsonOutput, null, 2));
console.log(`✓ Saved: ${CONFIG.outputFile}`);
