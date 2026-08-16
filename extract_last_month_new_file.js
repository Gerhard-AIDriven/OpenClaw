const XLSX = require('xlsx');
const fs = require('fs');

const wb = XLSX.readFile('Spar/Data Extracts/gws butchery new.xls');
const ws = wb.Sheets['Sheet1'];
const range = XLSX.utils.decode_range(ws['!ref']);

console.log('Sheet dimensions: ' + (range.e.r + 1) + ' rows x ' + (range.e.c + 1) + ' cols');

// Month columns are at: I, N, S, X, AC, AH, AM, AR, AW, BB, BG, BL, BQ, BV, CA, CF, CK, CP, CU, CZ, DA, DJ, DO, DT, DY, ED, EI, EN, ES, EX, FC, FH, FM, FR, FW, GB, GG, GL, GQ, GV, HA, HF, HK, HP, HU, HZ, IE, IJ, IO
// Sales Qty is the 2nd column in each 5-column block

const salesQtyColumns = [
  'J', 'P', 'V', 'AB', 'AH', 'AN', 'AT', 'AZ', 'BF', 'BL',
  'BR', 'BX', 'CD', 'CJ', 'CP', 'CV', 'DB', 'DH', 'DN', 'DT',
  'DZ', 'EF', 'EL', 'ER', 'EX', 'FD', 'FJ', 'FP', 'FV', 'GB',
  'GH', 'GN', 'GT', 'GZ', 'HF', 'HL', 'HR', 'HX', 'ID', 'IJ',
  'IP', 'IV', 'JB', 'JH', 'JN', 'JT', 'JZ', 'KF', 'KL'
];

const monthDates = [
  '01/03/22', '01/04/22', '01/05/22', '01/06/22', '01/07/22', '01/08/22', '01/09/22', '01/10/22', '01/11/22', '01/12/22',
  '01/01/23', '01/02/23', '01/03/23', '01/04/23', '01/05/23', '01/06/23', '01/07/23', '01/08/23', '01/09/23', '01/10/23',
  '01/11/23', '01/12/23', '01/01/24', '01/02/24', '01/03/24', '01/04/24', '01/05/24', '01/06/24', '01/07/24', '01/08/24',
  '01/09/24', '01/10/24', '01/11/24', '01/12/24', '01/01/25', '01/02/25', '01/03/25', '01/04/25', '01/05/25', '01/06/25',
  '01/07/25', '01/08/25', '01/09/25', '01/10/25', '01/11/25', '01/12/25', '01/01/26', '01/02/26', '01/03/26'
];

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
  let lastMonthIdx = -1;
  let lastSalesQty = 0;
  
  // Scan right-to-left
  for (let i = salesQtyColumns.length - 1; i >= 0; i--) {
    const cellRef = XLSX.utils.encode_cell({r, c: XLSX.utils.decode_col(salesQtyColumns[i])});
    const cell = ws[cellRef];
    
    let val = cell?.v || 0;
    // Handle formatted numbers with spaces
    if (typeof val === 'string') {
      val = parseFloat(val.replace(/\s/g, ''));
    }
    val = parseFloat(val) || 0;
    
    if (val > 0) {
      lastMonth = monthDates[i];
      lastMonthIdx = i;
      lastSalesQty = val;
      break;
    }
  }
  
  // Convert to readable format
  let lastMonthReadable = 'No sales recorded';
  let status = 'DEAD STOCK';
  let monthsAgo = 36;
  
  if (lastMonth) {
    // Parse date
    const [m, d, y] = lastMonth.split('/');
    const fullYear = '20' + y;
    const date = new Date(fullYear, parseInt(m) - 1, parseInt(d));
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
  dataSource: 'SPAR Sigma System - Department 2 (Butchery) [NEW FILE]',
  period: '1 March 2022 - 1 April 2026',
  reportDate: '18 April 2026',
  fileName: 'gws butchery new.xls',
  statusSummary: {
    ACTIVE: products.filter(p => p.status === 'ACTIVE').length,
    RECENT: products.filter(p => p.status === 'RECENT').length,
    STALE: products.filter(p => p.status === 'STALE').length,
    'DEAD STOCK': products.filter(p => p.status === 'DEAD STOCK').length
  },
  products: products
};

fs.writeFileSync('butchery_all_products_last_month_NEW.json', JSON.stringify(output, null, 2));

console.log('\n✓ Successfully extracted ' + products.length + ' products from NEW FILE\n');
console.log('Status Summary:');
console.log('  ACTIVE (0-2 months):     ' + output.statusSummary.ACTIVE);
console.log('  RECENT (3-4 months):     ' + output.statusSummary.RECENT);
console.log('  STALE (5-12 months):     ' + output.statusSummary.STALE);
console.log('  DEAD STOCK (12+ months): ' + output.statusSummary['DEAD STOCK']);

console.log('\n--- ACTIVE Products (First 15) ---');
products.filter(p => p.status === 'ACTIVE').slice(0, 15).forEach(p => {
  console.log('  ' + p.code.padEnd(8) + ' | ' + p.description.substring(0, 40).padEnd(40) + ' | ' + p.lastMonthReadable + ' | Qty: ' + Math.round(p.lastSalesQty));
});

console.log('\n--- RECENT Products (First 10) ---');
products.filter(p => p.status === 'RECENT').slice(0, 10).forEach(p => {
  console.log('  ' + p.code.padEnd(8) + ' | ' + p.description.substring(0, 40).padEnd(40) + ' | ' + p.lastMonthReadable + ' | Qty: ' + Math.round(p.lastSalesQty));
});

console.log('\n--- STALE Products (First 10) ---');
products.filter(p => p.status === 'STALE').slice(0, 10).forEach(p => {
  console.log('  ' + p.code.padEnd(8) + ' | ' + p.description.substring(0, 40).padEnd(40) + ' | ' + p.lastMonthReadable + ' | Qty: ' + Math.round(p.lastSalesQty));
});

console.log('\n--- DEAD STOCK Products (First 10) ---');
products.filter(p => p.status === 'DEAD STOCK').slice(0, 10).forEach(p => {
  console.log('  ' + p.code.padEnd(8) + ' | ' + p.description.substring(0, 40).padEnd(40) + ' | ' + p.lastMonthReadable + ' | Qty: ' + Math.round(p.lastSalesQty));
});

console.log('\n✓ Saved to: butchery_all_products_last_month_NEW.json');
