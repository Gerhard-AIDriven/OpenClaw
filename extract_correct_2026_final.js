const XLSX = require('xlsx');
const fs = require('fs');

const wb = XLSX.readFile('Spar/Data Extracts/gws butchery new.xls');
const ws = wb.Sheets['Sheet1'];
const range = XLSX.utils.decode_range(ws['!ref']);

console.log('Extracting with CORRECTED 2026 column mapping...\n');

// Correct month locations and their Sales Qty columns:
const monthLocations = [];

// Scan row 0 for all month headers (MM/DD/YY format)
for (let c = 0; c <= range.e.c; c++) {
  const cellRef = XLSX.utils.encode_cell({r: 0, c});
  const cell = ws[cellRef];
  const value = cell ? cell.v?.toString() : '';
  
  if (value.match(/^\d{1,2}\/\d{1,2}\/\d{2}$/)) {
    // Found a month header. Sales Qty is in the next column
    monthLocations.push({
      month: value,
      monthCol: c,
      salesQtyCol: c + 1,  // Sales Qty is 2nd in each block
      colLetter: XLSX.utils.encode_col(c + 1)
    });
  }
}

console.log(`Found ${monthLocations.length} months with headers`);
console.log('\n2026 Months:');
monthLocations.filter(m => m.month.includes('26')).forEach(m => {
  console.log(`  ${m.month} (month col ${XLSX.utils.encode_col(m.monthCol)}, qty col ${m.colLetter})`);
});

const products = [];

// Extract product data (rows 2 onwards)
for (let r = 2; r <= range.e.r; r++) {
  const code = ws[XLSX.utils.encode_cell({r, c: 0})]?.v;
  const desc = ws[XLSX.utils.encode_cell({r, c: 1})]?.v;
  
  if (!code || !desc) continue;
  
  // Skip summary rows
  if (desc.toString().includes('Totals') || desc.toString().includes('Total (Overall)')) {
    continue;
  }
  
  // Find last month with sales > 0
  let lastMonth = null;
  let lastSalesQty = 0;
  
  // Scan right-to-left through months
  for (let i = monthLocations.length - 1; i >= 0; i--) {
    const monthInfo = monthLocations[i];
    const cellRef = XLSX.utils.encode_cell({r, c: monthInfo.salesQtyCol});
    const cell = ws[cellRef];
    
    let val = cell?.v || 0;
    // Handle formatted numbers with spaces
    if (typeof val === 'string') {
      val = parseFloat(val.replace(/\s/g, ''));
    }
    val = parseFloat(val) || 0;
    
    if (val > 0) {
      lastMonth = monthInfo.month;
      lastSalesQty = val;
      break;
    }
  }
  
  // Convert to readable format
  let lastMonthReadable = 'No sales recorded';
  let status = 'DEAD STOCK';
  let monthsAgo = 36;
  
  if (lastMonth) {
    // Parse date (M/DD/YY or MM/DD/YY format)
    const parts = lastMonth.split('/');
    let m = parseInt(parts[0]);
    let d = parseInt(parts[1]);
    let y = parseInt(parts[2]);
    
    const fullYear = 2000 + y;
    const date = new Date(fullYear, m - 1, d);
    lastMonthReadable = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
    
    // Calculate months ago from April 18, 2026
    const now = new Date('2026-04-18');
    const diffTime = now - date;
    const diffMonths = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 30.44));
    monthsAgo = diffMonths;
    
    if (diffMonths <= 2) {
      status = 'ACTIVE';
    } else if (diffMonths <= 4) {
      status = 'RECENT';
    } else if (diffMonths <= 12) {
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

// Sort by status (ACTIVE first, DEAD STOCK last)
const statusOrder = { 'ACTIVE': 0, 'RECENT': 1, 'STALE': 2, 'DEAD STOCK': 3 };
products.sort((a, b) => {
  const cmp = statusOrder[a.status] - statusOrder[b.status];
  return cmp === 0 ? parseInt(a.code) - parseInt(b.code) : cmp;
});

// Create output
const output = {
  timestamp: new Date().toISOString(),
  totalProducts: products.length,
  dataSource: 'SPAR Sigma System - Department 2 (Butchery) [CORRECTED FINAL]',
  period: '1 March 2022 - 1 April 2026',
  reportDate: '18 April 2026',
  fileName: 'gws butchery new.xls',
  monthsDetected: monthLocations.length,
  statusSummary: {
    ACTIVE: products.filter(p => p.status === 'ACTIVE').length,
    RECENT: products.filter(p => p.status === 'RECENT').length,
    STALE: products.filter(p => p.status === 'STALE').length,
    'DEAD STOCK': products.filter(p => p.status === 'DEAD STOCK').length
  },
  products: products
};

fs.writeFileSync('butchery_all_products_last_month_FINAL.json', JSON.stringify(output, null, 2));

console.log('\n✓ Successfully extracted ' + products.length + ' products [CORRECTED]\n');
console.log('Status Summary:');
console.log('  ACTIVE (0-2 months):     ' + output.statusSummary.ACTIVE);
console.log('  RECENT (3-4 months):     ' + output.statusSummary.RECENT);
console.log('  STALE (5-12 months):     ' + output.statusSummary.STALE);
console.log('  DEAD STOCK (12+ months): ' + output.statusSummary['DEAD STOCK']);

console.log('\n--- ACTIVE Products (0-2 months) ---');
const activeProds = products.filter(p => p.status === 'ACTIVE').sort((a,b) => parseInt(a.code) - parseInt(b.code));
if (activeProds.length === 0) {
  console.log('  (None)');
} else {
  activeProds.slice(0, 20).forEach(p => {
    console.log('  ' + p.code.padEnd(8) + ' | ' + p.description.substring(0, 40).padEnd(40) + ' | ' + p.lastMonthReadable + ' | Qty: ' + Math.round(p.lastSalesQty));
  });
  if (activeProds.length > 20) console.log(`  ... and ${activeProds.length - 20} more`);
}

console.log('\n--- RECENT Products (3-4 months) - First 15 ---');
const recentProds = products.filter(p => p.status === 'RECENT').sort((a,b) => parseInt(a.code) - parseInt(b.code));
if (recentProds.length === 0) {
  console.log('  (None)');
} else {
  recentProds.slice(0, 15).forEach(p => {
    console.log('  ' + p.code.padEnd(8) + ' | ' + p.description.substring(0, 40).padEnd(40) + ' | ' + p.lastMonthReadable + ' | Qty: ' + Math.round(p.lastSalesQty));
  });
}

console.log('\n--- DEAD STOCK Products (12+ months) - First 10 ---');
const deadProds = products.filter(p => p.status === 'DEAD STOCK').sort((a,b) => parseInt(a.code) - parseInt(b.code));
deadProds.slice(0, 10).forEach(p => {
  console.log('  ' + p.code.padEnd(8) + ' | ' + p.description.substring(0, 40).padEnd(40) + ' | ' + p.lastMonthReadable + ' | Qty: ' + Math.round(p.lastSalesQty));
});

console.log('\n✓ Saved to: butchery_all_products_last_month_FINAL.json');
