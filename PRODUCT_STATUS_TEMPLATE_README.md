# SPAR Sigma Product Status Analysis Template

## Overview

This template automates the extraction and analysis of product sales status from **SPAR Sigma Excel exports** for any department. It identifies the last month each product had sales, classifies products by activity level, and generates a JSON dataset ready for reporting.

## File Structure

- **`extract_product_status_template.js`** — Main extraction script
- **`PRODUCT_STATUS_TEMPLATE_README.md`** — This documentation

## Key Features

✅ **Automatic Month Detection** — Scans Excel headers to find all months (no hardcoding)  
✅ **Correct Date Parsing** — Handles D/MM/YY format (e.g., "01/02/26" = 1st Feb 2026)  
✅ **Status Classification** — Categorizes products as ACTIVE, RECENT, STALE, or DEAD STOCK  
✅ **Works for Any Department** — Same file format across all SPAR departments  
✅ **Configurable Thresholds** — Customize status boundaries (months)  
✅ **Summary Statistics** — Automatic count and percentage calculations  

## File Format Requirements

The script expects a SPAR Sigma Excel export with:

- **Row 0:** Month headers in D/MM/YY format (e.g., "01/01/26", "01/02/26")
- **Row 1:** Column headers (Sales incl VAT, Sales Quantity, Gross Profit, GP Ratio %, GP %)
- **Rows 2+:** Product data (Code, Description, Department, and monthly columns)
- **5 columns per month:** Sales VAT | Sales Qty | Gross Profit | GP Ratio | GP %

### Column Structure Example
```
Row 0:  [blank]  [blank]  [blank]  [01/01/26]  [ ]  [ ]  [ ]  [ ]  [01/02/26]  ...
Row 1:  Code     Desc     Dept     VAT         Qty  GP   Ratio %  GP %  VAT    ...
Row 2:  11132    Product  2        5000        100  1000 20%      20%   4500   ...
```

## Usage

### Basic Usage
```bash
node extract_product_status_template.js
```
Uses defaults (hardcoded in CONFIG object)

### With Custom File
```bash
node extract_product_status_template.js "path/to/file.xls" "output.json"
```

### Full Parameters
```bash
node extract_product_status_template.js "path/to/file.xls" "output.json" "2026-04-18"
```

**Parameters:**
1. `input_file` — Path to Excel export (default: Spar/Data Extracts/gws butchery new.xls)
2. `output_file` — Path for JSON output (default: product_status_analysis.json)
3. `report_date` — Reference date for calculating "months ago" in ISO format (default: 2026-04-18)

### Example: Analyze Produce Department
```bash
node extract_product_status_template.js "Spar/Data Extracts/gws produce.xls" "produce_status.json" "2026-04-18"
```

## Configuration

Edit the `CONFIG` object in the script to customize for your department:

```javascript
const CONFIG = {
  inputFile: 'Spar/Data Extracts/gws butchery new.xls',
  outputFile: 'product_status_analysis.json',
  referenceDate: '2026-04-18',
  departmentName: 'Butchery',
  analysisStart: '1 March 2022',
  analysisEnd: '1 April 2026',
  statusThresholds: {
    active: 2,      // 0-2 months = ACTIVE
    recent: 4,      // 3-4 months = RECENT
    stale: 12,      // 5-12 months = STALE
    deadStock: null // 12+ months = DEAD STOCK
  }
};
```

### Status Thresholds
- **ACTIVE:** Last sale ≤ 2 months ago (current/recent activity)
- **RECENT:** Last sale 3-4 months ago (declining demand)
- **STALE:** Last sale 5-12 months ago (dormant, monitor closely)
- **DEAD STOCK:** Last sale 12+ months ago (culling candidates)

Adjust `statusThresholds` to match your business requirements.

## Output Format

The script generates a JSON file with:

```json
{
  "metadata": {
    "timestamp": "2026-04-18T20:11:00.000Z",
    "dataSource": "SPAR Sigma System - Butchery",
    "period": "1 March 2022 - 1 April 2026",
    "reportDate": "2026-04-18",
    "fileName": "gws butchery new.xls",
    "dateFormat": "D/MM/YY (e.g., 01/02/26 = 1st February 2026)",
    "monthsDetected": 49
  },
  "statusThresholds": { ... },
  "statusSummary": {
    "ACTIVE": 111,
    "RECENT": 15,
    "STALE": 53,
    "DEAD STOCK": 21,
    "total": 200
  },
  "products": [
    {
      "code": "11142",
      "description": "PORK FILLET",
      "lastMonth": "01/02/26",
      "lastMonthReadable": "February 2026",
      "lastSalesQty": 11.913,
      "status": "ACTIVE",
      "monthsAgo": 2
    },
    ...
  ]
}
```

## Common Use Cases

### 1. Analyze Produce Department
```bash
node extract_product_status_template.js "Spar/Data Extracts/gws produce.xls" "produce_status.json"
```

### 2. Analyze Deli Department
```bash
node extract_product_status_template.js "Spar/Data Extracts/gws deli.xls" "deli_status.json"
```

### 3. Batch Analysis (Multiple Departments)
Create a shell script:
```bash
#!/bin/bash
node extract_product_status_template.js "gws butchery.xls" "butchery_status.json"
node extract_product_status_template.js "gws produce.xls" "produce_status.json"
node extract_product_status_template.js "gws deli.xls" "deli_status.json"
node extract_product_status_template.js "gws dairy.xls" "dairy_status.json"
```

## Troubleshooting

### No months found
**Problem:** Script finds 0 months
**Solution:** Check that row 0 contains date headers in D/MM/YY format. Print first few cells to verify.

### All products show "DEAD STOCK"
**Problem:** Date parsing error
**Solution:** Verify dates are in D/MM/YY format (not MM/DD/YY or other). Check a sample cell value.

### Output file not created
**Problem:** Permissions or path issue
**Solution:** Ensure output directory exists and you have write permissions. Use absolute path if needed.

## Advanced: Extending the Script

### Add Custom Metrics
To add new columns to the output (e.g., total sales value):

1. Add calculation logic in the product loop (after line ~100)
2. Add new field to `products.push({...})`
3. Include in JSON output

### Change Sorting
To sort by sales quantity instead of status:

Replace:
```javascript
products.sort((a, b) => {
  const cmp = statusOrder[a.status] - statusOrder[b.status];
  return cmp === 0 ? parseInt(a.code) - parseInt(b.code) : cmp;
});
```

With:
```javascript
products.sort((a, b) => b.lastSalesQty - a.lastSalesQty);
```

### Filter Specific Products
To exclude certain products from analysis (e.g., test SKUs):

Add after line ~85:
```javascript
if (code.toString().startsWith('99999')) {
  continue; // Skip test codes
}
```

## Testing

Test with the butchery data:
```bash
node extract_product_status_template.js "Spar/Data Extracts/gws butchery new.xls" "test_output.json"
```

Expected output: 200 products, 111 ACTIVE, 15 RECENT, 53 STALE, 21 DEAD STOCK

## Notes

- **Date Format Assumption:** Script assumes D/MM/YY format. If your file uses MM/DD/YY, modify the parsing logic.
- **Sales Qty Column:** Assumes Sales Quantity is the 2nd column in each 5-column monthly block. Verify with your file structure.
- **Empty Months:** If a month has no sales for any product, it still gets detected and scanned (no performance impact).
- **Performance:** Processes ~200 products × 49 months in < 1 second.

## Version History

- **v1.0** (2026-04-18): Initial template for multi-department analysis
  - Automatic month detection
  - D/MM/YY date parsing
  - Status classification
  - JSON output with metadata

## Questions?

Refer back to the configuration section or examine the Excel file structure to verify it matches the expected format.
