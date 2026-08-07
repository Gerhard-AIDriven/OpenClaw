# Google Sheet Tracking Setup 📊

**Purpose:** Track all due diligence report orders from submission to delivery  
**Status:** Ready to implement  
**Date:** 2026-08-06

---

## Step 1: Create the Google Sheet

### A. Create New Sheet
1. Go to [sheets.google.com](https://sheets.google.com)
2. Click **+ Blank** spreadsheet
3. Name it: **"AI Driven - Due Diligence Orders"**
4. Share it with: gerhard@aidriven.biz (you're already logged in)

### B. Create Column Headers (Row 1)

Copy these exact headers into row 1 (cells A1 through R1):

| Column | Header Name | Purpose |
|--------|-------------|---------|
| **A** | Order ID | Unique identifier (auto-generated) |
| **B** | Timestamp | When order was submitted |
| **C** | Package | Basic / Standard / Premium |
| **D** | Price (NZD) | $75 / $125 / $200 |
| **E** | Customer Name | From form |
| **F** | Customer Email | From form |
| **G** | Customer Phone | From form (optional) |
| **H** | Property Address | Street address |
| **I** | Suburb | Suburb name |
| **J** | City | Napier / Hastings / CHB / Other |
| **K** | Postcode | 4-digit postcode |
| **L** | Property Type | Residential / Commercial / etc. |
| **M** | Customer Intent | Buying / Selling / Investor / Professional / Curious |
| **N** | Specific Concerns | Any notes from customer |
| **O** | Timeline | Standard / Priority / No rush |
| **P** | Payment Status | Pending / Paid / Refunded / Test (no payment) |
| **Q** | Payment Date | When PayPal confirmed |
| **R** | PayPal Transaction ID | From PayPal notification |
| **S** | Report Status | Not Started / In Progress / In Review / Delivered |
| **T** | Report Delivered Date | When sent to customer |
| **U** | Delivery Method | Email / Download Link |
| **V** | Customer Rating | 1-5 stars (follow-up) |
| **W** | Notes | Internal notes, issues, feedback |

### C. Format the Sheet

**Row 1 (Headers):**
- Select row 1
- Make **Bold** (Ctrl+B)
- Background color: Dark green (#007A4D - AI Driven green)
- Text color: White
- Freeze row 1: **View → Freeze → 1 row**

**Column Formatting:**
- **Column B (Timestamp):** Format → Number → Date time
- **Column D (Price):** Format → Number → Custom currency → $ NZD
- **Column Q (Payment Date):** Format → Number → Date time
- **Column T (Delivered Date):** Format → Number → Date time
- **Column V (Rating):** Data → Data validation → List of items: ⭐, ⭐⭐, ⭐⭐⭐, ⭐⭐⭐⭐, ⭐⭐⭐⭐⭐

**Alternate Row Colors (for readability):**
- Select all data rows (row 2 onwards)
- Format → Alternate colors
- Choose subtle gray alternating

### D. Create Additional Tabs

**Tab 2: "Payment Tracking"**
- For reconciling PayPal payments
- Columns: Date, Transaction ID, Customer, Amount, Fee, Net, Status

**Tab 3: "Monthly Stats"**
- Summary dashboard (we'll add formulas later)
- Total orders, revenue, conversion rate, etc.

---

## Step 2: Get the Sheet ID

1. Look at the URL in your browser:
   ```
   https://docs.google.com/spreadsheets/d/1aBcDeFgHiJkLmNoPqRsTuVwXyZ/edit#gid=0
   ```
2. Copy the long string between `/d/` and `/edit`:
   ```
   1aBcDeFgHiJkLmNoPqRsTuVwXyZ ← This is your SHEET_ID
   ```
3. Save this ID - you'll need it for the website integration

---

## Step 3: Deploy Google Apps Script (Form Handler)

### A. Open Script Editor
1. In your Google Sheet: **Extensions → Apps Script**
2. Delete any default code
3. Copy the script below (see next section)

### B. Paste This Code:

```javascript
// AI Driven - Due Diligence Order Tracker
// Handles form submissions from website

function doPost(e) {
  try {
    // Parse incoming data
    const data = JSON.parse(e.postData.contents);
    
    // Get the active sheet (first tab)
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Sheet1');
    if (!sheet) {
      return ContentService.createTextOutput(JSON.stringify({error: 'Sheet not found'}))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Generate unique Order ID
    const orderId = generateOrderId();
    const timestamp = new Date().toISOString();
    
    // Prepare row data (match column order from Step 1B)
    const rowData = [
      orderId,                    // A - Order ID
      timestamp,                  // B - Timestamp
      data.package || 'standard', // C - Package
      getPrice(data.package),     // D - Price
      data.name || '',            // E - Customer Name
      data.email || '',           // F - Customer Email
      data.phone || '',           // G - Customer Phone
      data.address || '',         // H - Property Address
      data.suburb || '',          // I - Suburb
      data.city || '',            // J - City
      data.postcode || '',        // K - Postcode
      data.propertyType || '',    // L - Property Type
      data.intent || '',          // M - Customer Intent
      data.concerns || '',        // N - Specific Concerns
      data.timeline || 'standard',// O - Timeline
      data.testMode ? 'Test (no payment)' : 'Pending', // P - Payment Status
      '',                         // Q - Payment Date (empty until paid)
      '',                         // R - PayPal Transaction ID (empty until paid)
      'Not Started',              // S - Report Status
      '',                         // T - Report Delivered Date
      '',                         // U - Delivery Method
      '',                         // V - Customer Rating
      data.testMode ? 'TEST ORDER - No payment required' : '' // W - Notes
    ];
    
    // Append row to sheet
    sheet.appendRow(rowData);
    
    // Format the new row (bold if test mode)
    const newRow = sheet.getLastRow();
    if (data.testMode) {
      sheet.getRange(newRow, 1, 1, 19).setFontWeight('bold');
      sheet.getRange(newRow, 16, 1, 1).setBackground('#ffffcc'); // Highlight payment status
    }
    
    // Success response
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      orderId: orderId,
      message: 'Order recorded successfully',
      package: data.package,
      testMode: data.testMode || false
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    // Error handling
    Logger.log('Error processing order: ' + error.toString());
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Helper: Generate unique Order ID
function generateOrderId() {
  const date = new Date();
  const year = date.getFullYear().toString().substr(-2);
  const month = ('0' + (date.getMonth() + 1)).slice(-2);
  const day = ('0' + date.getDate()).slice(-2);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `DD-${year}${month}${day}-${random}`;
}

// Helper: Get price based on package
function getPrice(pkg) {
  const prices = {
    'basic': 75,
    'standard': 125,
    'premium': 200
  };
  return prices[pkg] || 125; // Default to standard price
}

// Optional: Webhook handler for PayPal IPN (future automation)
function handlePayPalIPN(ipnData) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Sheet1');
  const data = sheet.getDataRange().getValues();
  
  // Find matching order by transaction ID or email
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const customerEmail = row[5]; // Column F
    const paymentStatus = row[15]; // Column P
    
    // If pending payment and email matches
    if (paymentStatus === 'Pending' && customerEmail === ipnData.payer_email) {
      const rowNum = i + 1; // 1-indexed
      
      // Update payment status
      sheet.getRange(rowNum, 16).setValue('Paid'); // Column P
      sheet.getRange(rowNum, 17).setValue(new Date().toISOString()); // Column Q
      sheet.getRange(rowNum, 18).setValue(ipnData.txn_id); // Column R
      
      // Change report status to "In Progress"
      sheet.getRange(rowNum, 19).setValue('In Progress'); // Column S
      
      Logger.log('Updated order for: ' + customerEmail);
      break;
    }
  }
}
```

### C. Save the Script
1. Click the **Save** icon (💾) or press Ctrl+S
2. Name it: **"Due Diligence Order Handler"**
3. Click **Deploy** button (top right)

### D. Deploy as Web App
1. **Deploy → New deployment**
2. Click gear icon ⚙️ → Select **Web app**
3. Fill in:
   - **Description:** "Due Diligence Order Form Handler"
   - **Execute as:** Me (your email)
   - **Who has access:** Anyone (important!)
4. Click **Deploy**
5. **Authorize access** when prompted (Grant permissions)
6. Copy the **Web app URL** (looks like: `https://script.google.com/macros/s/AKf.../exec`)

**This URL is your FORM HANDLER ENDPOINT** - save it!

---

## Step 4: Connect Website to Google Sheet

Now update your `index.html` to send form data to the Google Sheet.

### A. Find This Section in index.html:
Search for: `// Form Submission Handler`

### B. Replace the Form Handler With This:

```javascript
// Form Submission Handler
document.getElementById('dueDiligenceForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Get form data
    const formData = new FormData(this);
    const data = Object.fromEntries(formData.entries());
    
    // Get selected package from radio buttons
    const selectedRadio = document.querySelector('input[name="package"]:checked');
    const selectedPackage = selectedRadio ? selectedRadio.value : (data.package || 'standard');
    
    // Add test mode flag
    data.testMode = testMode;
    data.package = selectedPackage;
    
    // Google Apps Script Web App URL (REPLACE WITH YOURS!)
    const GOOGLE_SCRIPT_URL = 'YOUR_DEPLOYED_WEB_APP_URL_HERE';
    
    if (testMode) {
        // TEST MODE: Send to Google Sheet but skip payment
        submitToGoogleSheet(data, GOOGLE_SCRIPT_URL)
            .then(response => {
                alert('✅ TEST ORDER SUBMITTED\\n\\nOrder ID: ' + response.orderId + '\\nPackage: ' + selectedPackage.toUpperCase() + ' Report\\nProperty: ' + data.address + ', ' + data.suburb + '\\n\\nOrder recorded in Google Sheet (Test Mode - No Payment)');
                console.log('TEST ORDER:', response);
                
                // Reset form but keep package selection
                const currentPackage = selectedPackage;
                this.reset();
                setTimeout(() => selectPackage(currentPackage), 100);
            })
            .catch(error => {
                console.error('Error submitting test order:', error);
                alert('⚠️ Error saving order. Check console for details.');
            });
    } else {
        // LIVE MODE: First save to sheet, then redirect to PayPal
        submitToGoogleSheet(data, GOOGLE_SCRIPT_URL)
            .then(response => {
                // Store order data for post-payment tracking
                sessionStorage.setItem('ddm_orderData', JSON.stringify({
                    ...data,
                    orderId: response.orderId,
                    timestamp: new Date().toISOString(),
                    paymentStatus: 'pending'
                }));
                
                // Show confirmation before redirect
                const packageNames = {
                    basic: 'Basic Property Due Diligence Report ($75 NZD)',
                    standard: 'Standard Property Due Diligence Report ($125 NZD)',
                    premium: 'Premium Property Due Diligence Report ($200 NZD)'
                };
                
                if (confirm('✅ Order Saved!\\n\\nOrder ID: ' + response.orderId + '\\n\\nReady to complete payment?\\n\\nYou will be redirected to PayPal to pay for:\\n' + packageNames[selectedPackage] + '\\n\\nProperty: ' + data.address + ', ' + data.suburb + '\\n\\nClick OK to proceed to PayPal.')) {
                    // Redirect to PayPal
                    window.location.href = PAYPAL_LINKS[selectedPackage];
                }
            })
            .catch(error => {
                console.error('Error submitting order:', error);
                alert('⚠️ Error saving order. Please try again or contact us directly.');
            });
    }
});

// Helper: Submit data to Google Sheet
async function submitToGoogleSheet(data, scriptUrl) {
    const response = await fetch(scriptUrl, {
        method: 'POST',
        mode: 'no-cors', // Important for Google Apps Script
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    
    // With no-cors, we can't read the response, but we know it succeeded if no error
    return {
        success: true,
        orderId: 'Saved to sheet',
        message: 'Order recorded'
    };
}
```

### C. Replace the Placeholder
Find this line:
```javascript
const GOOGLE_SCRIPT_URL = 'YOUR_DEPLOYED_WEB_APP_URL_HERE';
```

Replace with your actual Google Apps Script web app URL from Step 3D.

---

## Step 5: Test the Integration

### Test Mode (Recommended First):
1. Enable **Test Mode** on your website (🧪 button)
2. Fill out the form with test data
3. Submit the form
4. Check your Google Sheet - new row should appear!
5. Verify all data populated correctly
6. Check that "Payment Status" shows "Test (no payment)"

### Live Mode (After Test Mode Works):
1. Disable Test Mode
2. Fill out form with real data
3. Submit → Order saved to sheet with "Pending" payment
4. Complete PayPal payment
5. Manually update the sheet:
   - Column P: Change "Pending" → "Paid"
   - Column Q: Add payment date
   - Column R: Add PayPal Transaction ID (from email)
   - Column S: Change "Not Started" → "In Progress"

---

## Step 6: Manual Payment Reconciliation (For Now)

When you receive a PayPal payment notification email:

1. Open your Google Sheet
2. Find the order by customer email or property address
3. Update these columns:
   - **P (Payment Status):** Pending → Paid
   - **Q (Payment Date):** =NOW()
   - **R (PayPal Transaction ID):** Copy from PayPal email
   - **S (Report Status):** Not Started → In Progress

4. Generate and deliver the report
5. Update:
   - **T (Delivered Date):** =NOW()
   - **U (Delivery Method):** Email
   - **S (Report Status):** In Progress → Delivered

---

## Step 7: Future Automation (After 10+ Orders)

### PayPal IPN Integration:
- Set up PayPal Instant Payment Notification
- Automatically update sheet when payment received
- Trigger report generation workflow
- Send delivery email automatically

### Email Templates:
We can create pre-written email templates for:
- Order confirmation (with PayPal link)
- Payment received + report being prepared
- Report delivered
- Follow-up for rating/feedback

---

## Quick Reference

### Order ID Format:
```
DD-YYMMDDD-XXX
Example: DD-260806-001 (First order on Aug 6, 2026)
```

### Package Pricing:
- Basic: $75
- Standard: $125
- Premium: $200

### Payment Status Values:
- Pending (awaiting PayPal payment)
- Paid (confirmed)
- Refunded
- Test (no payment)

### Report Status Values:
- Not Started
- In Progress
- In Review
- Delivered

---

## Troubleshooting

### Form submits but nothing appears in sheet:
- Check Google Apps Script URL is correct
- Verify script is deployed as "Anyone can access"
- Check browser console for errors (F12)

### "Permission denied" error:
- Re-deploy the Apps Script
- Make sure you authorized access
- Check "Execute as" is set to "Me"

### Data appears in wrong columns:
- Verify column headers match Step 1B exactly
- Check the `rowData` array order in the script

---

**Ready to set it up?** Follow the steps above, and let me know if you need help with any part! 🚀
