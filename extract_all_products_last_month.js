const XLSX = require('xlsx');
const fs = require('fs');

// Read Excel file
const wb = XLSX.readFile('Spar/Data Extracts/gws butchery.xls');
const ws = wb.Sheets['Sheet1'];

// Convert to JSON
const data = XLSX.utils.sheet_to_json(ws, { defval: '' });

// Month columns are in format: 01/03/22, 01/04/22, etc.
// We need to identify them and sort chronologically

const products = [];
const monthMap = {}; // Map month string to index

// Get first row to identify month columns
const firstRow = data[0];
const monthColumns = [];

for (const key in firstRow) {
  // Check if key looks like a date (MM/DD/YY)
  if (typeof key === 'string' && key.match(/^\d{1,2}\/\d{1,2}\/\d{2}$/)) {
    monthColumns.push(key);
  }
}

// Sort months chronologically
monthColumns.sort((a, b) => {
  const dateA = new Date(a);
  const dateB = new Date(b);
  return dateA - dateB;
});

console.log('Found ' + monthColumns.length + ' month columns');
console.log('First month:', monthColumns[0]);
console.log('Last month:', monthColumns[monthColumns.length - 1]);

// Process each product
data.forEach((row, idx) => {
  if (!row['Product Code'] || !row['Product Description']) {
    return;
  }
  
  const code = row['Product Code'];
  const desc = row['Product Description'];
  
  // Skip non-product rows
  if (desc === 'Totals' || desc.includes('Total (Overall)')) {
    return;
  }
  
  // Find last month with sales > 0
  let lastMonth = null;
  let lastSalesQty = 0;
  
  // Scan right-to-left through months
  for (let i = monthColumns.length - 1; i >= 0; i--) {
    const monthKey = monthColumns[i];
    const salesQty = parseFloat(row[monthKey]) || 0;
    
    if (salesQty > 0) {
      lastMonth = monthKey;
      lastSalesQty = salesQty;
      break;
    }
  }
  
  // Convert date string to readable format
  let lastMonthReadable = 'No sales recorded';
  if (lastMonth) {
    const [m, d, y] = lastMonth.split('/');
    const fullYear = '20' + y;
    const date = new Date(fullYear, parseInt(m) - 1, parseInt(d));
    lastMonthReadable = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }
  
  // Determine status
  let status = 'DEAD STOCK';
  let monthsAgo = 24;
  
  if (lastMonth) {
    const lastDate = new Date(lastMonth);
    const now = new Date('2026-04-18');
    const diffTime = now - lastDate;
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
});

// Sort by status priority (ACTIVE first, then DEAD STOCK last)
const statusOrder = { 'ACTIVE': 0, 'RECENT': 1, 'STALE': 2, 'DEAD STOCK': 3 };
products.sort((a, b) => {
  const cmp = statusOrder[a.status] - statusOrder[b.status];
  return cmp === 0 ? a.code - b.code : cmp;
});

// Save to JSON
const output = {
  timestamp: new Date().toISOString(),
  totalProducts: products.length,
  dataSource: 'SPAR Sigma System - Department 2 (Butchery)',
  period: '1 March 2022 - 1 April 2026',
  statusSummary: {
    ACTIVE: products.filter(p => p.status === 'ACTIVE').length,
    RECENT: products.filter(p => p.status === 'RECENT').length,
    STALE: products.filter(p => p.status === 'STALE').length,
    'DEAD STOCK': products.filter(p => p.status === 'DEAD STOCK').length
  },
  products: products
};

fs.writeFileSync('butchery_all_products_last_month.json', JSON.stringify(output, null, 2));

console.log('\n✓ Extracted ' + products.length + ' products');
console.log('\nStatus Summary:');
console.log('  ACTIVE: ' + output.statusSummary.ACTIVE);
console.log('  RECENT: ' + output.statusSummary.RECENT);
console.log('  STALE: ' + output.statusSummary.STALE);
console.log('  DEAD STOCK: ' + output.statusSummary['DEAD STOCK']);
console.log('\nFirst 5 ACTIVE products:');
products.filter(p => p.status === 'ACTIVE').slice(0, 5).forEach(p => {
  console.log('  ' + p.code + ' - ' + p.description + ' (' + p.lastMonthReadable + ')');
});
console.log('\nFirst 5 DEAD STOCK products:');
products.filter(p => p.status === 'DEAD STOCK').slice(0, 5).forEach(p => {
  console.log('  ' + p.code + ' - ' + p.description + ' (' + p.lastMonthReadable + ')');
});
