# 📊 Tracking System - Quick Start Checklist

**Goal:** Get order tracking live in 15 minutes  
**Status:** Ready to implement  
**Date:** 2026-08-06

---

## ✅ Step-by-Step (Do This Now)

### Step 1: Create Google Sheet (5 minutes)

1. Go to [sheets.google.com](https://sheets.google.com)
2. Click **+ Blank** spreadsheet
3. Name it: `AI Driven - Due Diligence Orders`
4. In cell A1, paste this header row (copy all):

```
Order ID	Timestamp	Package	Price (NZD)	Customer Name	Customer Email	Customer Phone	Property Address	Suburb	City	Postcode	Property Type	Customer Intent	Specific Concerns	Timeline	Payment Status	Payment Date	PayPal Transaction ID	Report Status	Report Delivered Date	Delivery Method	Customer Rating	Notes
```

5. **Format headers:**
   - Select row 1 → Make **Bold** (Ctrl+B)
   - Background: Dark green (#007A4D)
   - Text: White
   - **View → Freeze → 1 row**

6. **Widen columns:** Double-click between column headers to auto-fit

✅ **Done?** Your sheet is ready!

---

### Step 2: Deploy Google Apps Script (5 minutes)

1. In your Google Sheet: **Extensions → Apps Script**
2. Delete the default `function myFunction() {...}` code
3. Copy the entire script from `GOOGLE_SHEET_TRACKING_SETUP.md` (Step 3B)
4. Paste into the editor
5. Click **💾 Save** → Name: `Due Diligence Order Handler`
6. Click **Deploy → New deployment**
7. Click ⚙️ → Select **Web app**
8. Fill in:
   - Description: `Due Diligence Form Handler`
   - Execute as: **Me**
   - Who has access: **Anyone** ← Important!
9. Click **Deploy**
10. Grant permissions when asked (Review permissions → Allow)
11. **Copy the Web app URL** (starts with `https://script.google.com/macros/s/...`)

✅ **Done?** Save this URL - you need it next!

---

### Step 3: Update Website (2 minutes)

1. Open: `C:\Users\gstim\.openclaw\workspace\due-diligence-mvp\index.html`
2. Find this line (Ctrl+F): `const GOOGLE_SCRIPT_URL =`
3. Replace the placeholder with your URL:

```javascript
// BEFORE:
const GOOGLE_SCRIPT_URL = 'YOUR_DEPLOYED_WEB_APP_URL_HERE';

// AFTER (example):
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxXYZ123.../exec';
```

4. Save the file

✅ **Done?** Integration complete!

---

### Step 4: Test It (3 minutes)

#### Test Mode Test:
1. Open website: `file:///C:/Users/gstim/.openclaw/workspace/due-diligence-mvp/index.html`
2. Click **🧪 Test Mode: ON** (button turns green)
3. Fill out form with fake data:
   - Name: Test User
   - Email: test@example.com
   - Property: 123 Test Street, Marewa, Napier
   - Select any package
4. Click **Submit Order Request**
5. You should see: ✅ "TEST ORDER SUBMITTED ... Order saved to Google Sheet"
6. **Check your Google Sheet** - new row should appear!
7. Verify all data populated correctly

✅ **Working?** Great! Move to live test.

#### Live Mode Test (Optional but Recommended):
1. Turn **Test Mode OFF**
2. Fill form with your own details (real email!)
3. Select a package (e.g., Standard $125)
4. Click **Submit Order Request**
5. Should see: ✅ "Order Saved! Order ID: ..."
6. Click OK to proceed to PayPal
7. **STOP HERE** - don't complete payment yet (it's your money!)
8. Check Google Sheet - order should show as "Pending" payment

✅ **Sheet updated?** Perfect! System is working!

---

## 🎯 What You've Built

### Order Flow:
```
Customer fills form
    ↓
Data saved to Google Sheet (with Order ID)
    ↓
Customer redirected to PayPal
    ↓
Customer pays
    ↓
You get PayPal email notification
    ↓
You manually update sheet: Pending → Paid
    ↓
You generate & deliver report
    ↓
Update sheet: Not Started → Delivered
```

### Sheet Columns (Key Ones):

| Column | What It Tracks | When Updated |
|--------|----------------|--------------|
| **A-B** | Order ID + Timestamp | Auto on submit |
| **C-D** | Package + Price | Auto from form |
| **E-G** | Customer details | Auto from form |
| **H-O** | Property + requirements | Auto from form |
| **P** | Payment Status | Auto: "Pending" or "Test"<br>Manual: "Paid" after PayPal |
| **Q-R** | Payment date + TX ID | Manual from PayPal email |
| **S** | Report Status | Manual: Not Started → In Progress → Delivered |
| **T-U** | Delivery info | Manual when sent |
| **V** | Rating | Follow-up with customer |
| **W** | Notes | Internal notes |

---

## 📋 Manual Workflow (For Now)

### When Order Comes In:
1. **Google Sheet updates automatically** ✅
2. You get email notification? (Set up Gmail filter if needed)
3. Check sheet for new "Pending" orders

### After PayPal Payment:
1. You receive PayPal notification email
2. Open Google Sheet
3. Find the order (by email or property address)
4. Update these cells:
   - **Column P:** Change "Pending" → "Paid"
   - **Column Q:** `=NOW()` (current date/time)
   - **Column R:** Copy Transaction ID from PayPal email
   - **Column S:** Change "Not Started" → "In Progress"

### Generate & Deliver Report:
1. Create report (manual or automated - your choice)
2. Email PDF to customer
3. Update sheet:
   - **Column T:** `=NOW()`
   - **Column U:** "Email"
   - **Column S:** "In Progress" → "Delivered"

### Follow-up (3-7 days later):
1. Email customer: "How was your report?"
2. Ask for rating (1-5 stars)
3. Update **Column V** with star rating
4. Add any feedback to **Column W**

---

## 🔔 Pro Tips

### Gmail Filter (Auto-label Order Emails):
1. Gmail Settings → Filters and Blocked Addresses → Create new filter
2. Subject contains: `Payment received` OR From: `service@paypal.com`
3. Apply label: `Due Diligence Orders` (create new label)
4. Also apply category: Primary (don't miss these!)

### Google Sheet Notifications:
1. In Google Sheet: **Tools → Notification rules**
2. Set up: "Any changes are made" → "Email - right away"
3. Now you get emailed when orders come in!

### Keyboard Shortcuts for Sheet Updates:
- **Ctrl+;** = Insert current date
- **Ctrl+Shift+:** = Insert current time
- **Ctrl+Enter** = Fill selected range with same value

### Color Coding (Visual Status):
Conditional formatting ideas:
- **Payment Status = "Paid"** → Green background
- **Payment Status = "Pending"** → Yellow background
- **Report Status = "Delivered"** → Blue text
- **Rating = ⭐⭐⭐⭐⭐** → Gold highlight

---

## ⚠️ Troubleshooting

### Form submits but sheet doesn't update:
- Check GOOGLE_SCRIPT_URL is correct (no typos)
- Verify script deployed as "Anyone can access"
- Check browser console (F12) for errors
- Try re-deploying the Apps Script

### "Permission denied" error:
- Re-open Apps Script editor
- Click **Run** button once to authorize
- Re-deploy as web app

### Data in wrong columns:
- Verify header row matches the template exactly
- Check no columns were inserted/deleted accidentally

### Test mode not saving:
- Make sure GOOGLE_SCRIPT_URL is configured
- Check browser console for error messages
- Verify Apps Script is active (not paused)

---

## 📈 Next Steps (After First 10 Orders)

### Automate Payment Tracking:
- Set up PayPal IPN (Instant Payment Notification)
- Auto-update sheet when payment received
- Trigger email notifications

### Email Templates:
Create canned responses for:
- Order confirmation (auto-send with PayPal link)
- Payment received + report in progress
- Report delivered
- Follow-up for rating

### Dashboard View:
Add summary formulas:
- Total orders this month
- Revenue by package type
- Average delivery time
- Customer satisfaction average

### Zapier Automation (Optional):
Connect: Google Forms → Gmail → Google Sheets → Slack
Cost: ~$30/month (Starter plan)
Time saved: Hours per week

---

## 🎉 You're Ready!

**Complete checklist:**
- ✅ Google Sheet created with headers
- ✅ Apps Script deployed and URL copied
- ✅ Website updated with script URL
- ✅ Test mode tested - works!
- ✅ Live mode tested - works!

**Now you can:**
- Accept real orders
- Track every order from submission to delivery
- Monitor payment status
- Measure customer satisfaction
- Scale your business! 🚀

---

**Questions?** Check the full guide: `GOOGLE_SHEET_TRACKING_SETUP.md`

**Need email templates or automation help?** Just ask!
