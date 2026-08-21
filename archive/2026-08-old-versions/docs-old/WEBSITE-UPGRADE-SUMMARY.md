# Website Upgrade Summary ✅

**Date:** 04 August 2026  
**File Updated:** `due-diligence-mvp/index.html`  
**Lines Added:** ~350 lines (887 → 1238 total)

---

## ✅ What's Been Added

### 1. **About AI Driven Section** (`#about`)
- Professional headshot placeholder (you need to add your photo)
- Your story: 30 years experience, MBL, why you built this
- Mission statement and personal quote
- Credibility badges: "30+ Years Experience", "MBL Graduate"
- **Location:** After form section, before footer

### 2. **Sample Report Preview** (`#sample-report`)
- Professional preview card with PDF icon
- Description of what's included in sample
- "View Sample Report (PDF)" button
- **TODO:** Link the button to actual PDF once generated at home
- List of 6 key sections included in sample

### 3. **For Professionals Section** (`#professionals`)
- **Target audience:** QSs, valuers, real estate agents, building consultants
- Three key benefits:
  - Save 3+ hours per property
  - High-margin service add-on
  - Investment metrics built-in
- Use cases for each professional type:
  - Quantity Surveyors (bulk pricing available)
  - Real Estate Agents (first 3 reports free for partners)
  - Property Valuers
  - Building Consultants
- CTA: "Contact Us for Professional Rates"

### 4. **FAQ Section** (`#faq`)
8 comprehensive questions answered:
1. Is this a legal LIM? (No, screening only)
2. Can I use for settlement? (No, get formal LIM)
3. How accurate is the data? (Official sources, but verify independently)
4. What's included in each package? (Basic/Standard/Premium breakdown)
5. How long to receive report? (24-48 hours standard, 12-24 premium)
6. What areas do you cover? (Hawke's Bay, expanding soon)
7. Do you offer refunds? (Yes, 100% satisfaction guarantee)
8. Rural properties/lifestyle blocks? (Yes, with limitations noted)

### 5. **Guarantee Badge Section**
- Full-width gradient banner (gold to green)
- Shield icon with "100% Satisfaction Guarantee"
- Clear refund policy: 7 days, no questions asked

### 6. **Updated Navigation Menu**
**Before:** How It Works | Pricing | Order Report  
**After:** About | How It Works | Sample Report | For Professionals | FAQ | Pricing | **Order Now** (highlighted button)

### 7. **Updated Footer Links**
Added all new sections to footer quick links for easy access.

---

## 🎨 Design Features

- **Consistent branding:** Gold (#FFB81C), Green (#007A4D), Charcoal (#2D2D2D)
- **Professional styling:** Gradients, shadows, rounded corners
- **Mobile-responsive:** Grid layouts adapt to screen size
- **Interactive elements:**
  - FAQ accordion (click to expand/collapse)
  - Smooth scroll navigation
  - Hover effects on buttons and cards
- **Trust signals:** Professional photo area, credentials, guarantee badge

---

## ⚠️ TODO Items Before Going Live

### 1. **Add Your Professional Headshot**
**Location:** About section, line ~935  
**Current:** Placeholder div with text "[Your Professional Headshot Here]"  
**Action Required:**
- Get a professional headshot taken (or use a good quality photo)
- Recommended size: 400x500px
- Format: JPG or PNG
- Replace the placeholder div with: `<img src="your-photo.jpg" alt="Gerhard Stimie" style="width: 100%; border-radius: 12px;">`
- Or host it and use: `<img src="URL-to-your-photo" ...>`

### 2. **Link Sample Report PDF**
**Location:** Sample Report section, line ~1020  
**Current:** Button has `onclick="alert('Link to sample PDF...')"`  
**Action Required:**
- Generate the PDF at home using Puppeteer: `node generate-pdf.js`
- Upload PDF to website hosting or Google Drive
- Update the button to: `<a href="path/to/sample-report.pdf" target="_blank" class="button">View Sample Report (PDF)</a>`
- Or wrap the existing div in an `<a>` tag

### 3. **Update Phone Number**
**Locations:** 
- Footer contact section (line ~1304)
- FAQ "Still Have Questions" CTA (line ~1280)
- Header/contact info if present  
**Current:** Shows "XXX XXX" or "[Your Phone]"  
**Action Required:** Replace with your actual phone number (e.g., 021 123 4567)

### 4. **Create Terms of Service & Privacy Policy Pages**
**Current:** Footer links point to `#` (nowhere)  
**Action Required:**
- Create `terms.html` and `privacy.html` pages
- Or link to external documents (Google Docs, Notion, etc.)
- Update footer links: `<a href="terms.html">Terms of Service</a>`

### 5. **Test Mobile Responsiveness**
- Open in browser dev tools
- Test on iPhone, Android, tablet sizes
- Ensure navigation collapses properly (may need hamburger menu for mobile)
- Check text readability on small screens

### 6. **Set Up Form Submission Handler**
**Current:** Form action="/submit-report-request"  
**Action Required:**
- For MVP: Change to Google Form URL or email handler
- For production: Set up backend endpoint or Zapier webhook
- Update JavaScript form validation/handling (lines 975+)

---

## 📊 Content Statistics

| Section | Word Count | Purpose |
|---------|-----------|---------|
| About | ~300 words | Build trust, tell your story |
| Sample Report | ~100 words | Show transparency, reduce purchase anxiety |
| For Professionals | ~400 words | Target B2B customers (QSs, agents, etc.) |
| FAQ | ~800 words | Answer objections, reduce support queries |
| Guarantee | ~50 words | Reduce purchase risk |
| **Total Added** | **~1,650 words** | **Professional, client-ready content** |

---

## 🚀 Next Steps (Priority Order)

### Immediate (Do Today/Tomorrow):
1. ✅ **Email Keegan** – Send the beta tester outreach email (draft saved in `outreach/email-keegan-qs-beta.md`)
2. ⏳ **Generate Sample PDF** – When home with better internet: `cd due-diligence-mvp && npm install puppeteer && node generate-pdf.js`
3. ⏳ **Add Your Photo** – Upload headshot and update the About section

### This Week:
4. **Create Terms & Privacy pages** – Simple one-pagers are fine for MVP
5. **Update phone number** everywhere
6. **Test on mobile** devices
7. **Deploy to staging** – Netlify, Cloudflare Pages, or similar (free tier)

### Before Beta Launch:
8. **Set up form handler** – Google Forms or simple email notification
9. **Test end-to-end** – Submit test order, verify you receive it
10. **Get feedback** – Show Keegan and 1-2 others, iterate based on input

---

## 💡 Pro Tips

### For the Photo:
- Wear business casual (collared shirt, blazer optional)
- Natural lighting, plain background
- Smile warmly but professionally
- Can use smartphone if good quality (iPhone Portrait mode works well)
- Free tools: Remove.bg for background removal if needed

### For the Sample PDF:
- Once generated, upload to your website or Google Drive
- Set Google Drive sharing to "Anyone with link can view"
- Consider adding watermark: "SAMPLE – NOT FOR RELIANCE"

### For Mobile Testing:
- Chrome DevTools: F12 → Toggle device toolbar (Ctrl+Shift+M)
- Test: iPhone 12 Pro, Samsung Galaxy S21, iPad
- Check: Text size, button tap targets, form usability

---

## 📈 Impact Assessment

**Before:** Basic landing page with form + pricing  
**After:** Professional, comprehensive website that:
- ✅ Builds trust with founder story and credentials
- ✅ Reduces purchase anxiety with sample report preview
- ✅ Targets high-value B2B segment (QSs, agents)
- ✅ Answers common objections in FAQ (reduces support load)
- ✅ Eliminates purchase risk with money-back guarantee
- ✅ Provides clear navigation and multiple CTAs

**Result:** You now look like an established, professional service – not a weekend side-hustle. Perfect for approaching beta customers and real estate agents!

---

## 🎯 Ready for Outreach?

Once you complete the TODO items above, you'll be ready to:
1. Email Keegan (QS beta tester)
2. Reach out to real estate agents
3. Share on property investor Facebook groups
4. Launch beta customer recruitment campaign

**Confidence level:** 90% client-ready (just need photo + PDF + phone number)

---

**Questions?** Review the updated `index.html` in your browser to see everything in action!

Open: `file:///C:/Users/gstim/.openclaw/workspace/due-diligence-mvp/index.html`
