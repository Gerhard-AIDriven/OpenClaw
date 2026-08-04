# Property Due Diligence Report - Input Requirements

**Product Name:** Property Due Diligence Report (not "LIM-Lite" - clearer differentiation)  
**Target Users:** Real estate agents, property buyers, property investors, sellers  
**Purpose:** Automated preliminary property intelligence for screening and initial due diligence

---

## Minimum Required Inputs

### Essential (Cannot Generate Report Without These):

| Field | Format | Source | Validation |
|-------|--------|--------|------------|
| **Property Address** | Full street address | Client/Agent | Must be valid NZ address |
| **Suburb** | Text | Client/Agent | Cross-check with address |
| **City/District** | Text (e.g., "Napier") | Client/Agent | Determines which council APIs to query |
| **Postcode** | 4-digit number | Client/Agent | Optional but improves geocoding accuracy |

**Why These Are Essential:**
- Address is the primary key for all API queries
- Council district determines which GIS endpoints to use (Napier vs Hastings vs other)
- Geocoding requires full address to find correct parcel/title

---

## Recommended Additional Inputs

### Helpful But Not Critical:

| Field | Format | Why It Helps | If Missing... |
|-------|--------|--------------|---------------|
| **Property Type** | Residential/Commercial/Industrial/Mixed Use | Filters relevant data layers | We infer from zoning |
| **Intended Use** | Owner-occupier/Rental/Development/Flip | Tailors report emphasis | Default to general residential |
| **Budget Range** | Price bracket (e.g., $600k-$700k) | Context for investment analysis | Skip ROI calculations |
| **Specific Concerns** | Free text (e.g., "worried about flooding") | Prioritizes relevant sections | Include all standard sections |
| **Timeline** | Urgent/Standard/Research mode | Adjusts depth of analysis | Default to standard depth |

---

## Optional Enhancement Inputs

### For Advanced/Premium Reports:

| Field | Format | Value Add |
|-------|--------|-----------|
| **Comparable Properties** | List of nearby addresses | Market context analysis |
| **Purchase Price (if known)** | Number | Investment metrics, ROI calc |
| **Rental Expectations** | Weekly rent estimate | Yield calculations |
| **Renovation Plans** | Brief description | Flag consent requirements |
| **Previous LIM Reports** | Upload PDF | Compare historical data |
| **Builder's Inspection** | Upload report | Cross-reference findings |

---

## Input Collection Methods

### Method 1: Web Form (Recommended for Scale)
```
[Simple 5-field form]
- Street Address*
- Suburb*
- City/District* (dropdown)
- Postcode
- Email for delivery*

[Optional section - expandable]
- Property Type (dropdown)
- Intended Use (dropdown)
- Specific Concerns (text box)
```

**Pros:** Standardized, automated, scalable  
**Cons:** Less personal, may miss nuances

---

### Method 2: Email Request
**Template for Agents/Clients:**
```
Subject: Due Diligence Report Request - [Property Address]

Hi Seb,

Please generate a Property Due Diligence Report for:

Address: [full address]
Suburb: [suburb]
City: [Napier/Hastings/etc.]
Postcode: [postcode]

Optional details:
- Property type: [residential/commercial/etc.]
- I'm planning to: [buy/sell/invest/develop]
- Main concerns: [flooding/consents/zoning/etc.]
- Timeline: [urgent/within 48hrs/this week]

Thanks,
[Name]
[Phone]
```

**Pros:** Flexible, captures nuance  
**Cons:** Manual processing, slower

---

### Method 3: Phone/WhatsApp Intake
**Script for Gerhard or Assistant:**
```
"Sure, I can set that up. I just need:
1. The full property address?
2. Which suburb and city is it in?
3. Your email to send the report?

Optional - helps me tailor it:
4. Are you buying, selling, or just researching?
5. Any specific concerns like flooding or consents?
6. How soon do you need it?"
```

**Pros:** Personal, builds relationship  
**Cons:** Time-intensive, requires staff

---

### Method 4: Integration with Real Estate Platforms
**Future State:**
- Trade Me Property integration (auto-capture from listing)
- Realestate.co.nz webhook
- CRM integration (AgencyBase, etc.)

**Data Captured Automatically:**
- Address, suburb, postcode from listing
- Property type, land area, floor area
- Listing price, agent details
- Photos, description

---

## Input Validation Rules

### Address Validation:
```javascript
// Pseudo-code for validation
function validateAddress(address) {
  // Check against LINZ Address Points API
  // Return: matched address + geocode + confidence score
  
  if (confidence < 0.8) {
    return { 
      status: 'uncertain', 
      suggestions: ['Did you mean 123 Smith St?', 'Check suburb spelling'] 
    }
  }
  
  return { status: 'valid', parcelId: 'XYZ123', coordinates: [...] }
}
```

### Council District Detection:
```
Input: "Napier" → Query Napier GIS API
Input: "Hastings" → Query Hastings GIS API (if available)
Input: "Wellington" → Query Wellington City API
Input: Unknown → Flag for manual review, use LINZ only
```

---

## Edge Cases & Handling

### Case 1: Rural Properties (No Street Number)
**Input:** "Old Taupo Road, RD5, Napier"  
**Handling:**
- Use road name + rural delivery number
- May require manual parcel ID lookup
- Flag in report: "Rural property - some data layers may be incomplete"

### Case 2: Multi-Unit Developments
**Input:** "Flat 3, 45 Marine Parade" or "Unit 12, 78 Station Street"  
**Handling:**
- Query parent parcel for land-level data
- Note: "Strata/unit title - building consents may apply to whole complex"
- Recommend: "Request body corporate records separately"

### Case 3: New Subdivisions (Not Yet in Systems)
**Input:** Brand new address not in LINZ database  
**Handling:**
- API returns no match
- Flag: "New subdivision - data may be incomplete"
- Recommend: "Contact council directly for preliminary information"
- Offer: Manual research service at premium price

### Case 4: Cross-Boundary Properties
**Input:** Property spans two council districts  
**Handling:**
- Detect via parcel geometry
- Query both council APIs
- Combine results, note boundary issue
- Flag: "Property crosses council boundary - additional checks recommended"

---

## Consent & Legal Requirements

### Privacy Act 2020 Compliance:
**Required Disclosure:**
```
By requesting this report, you acknowledge:
- We will process your contact details for report delivery
- Property address is recorded for quality assurance
- Data is retained for 90 days unless you request deletion
- We do not sell or share your information with third parties
```

**Opt-in Options:**
- ☐ Keep me informed about similar properties
- ☐ Add me to monthly market updates newsletter
- ☐ Contact me about premium due diligence services

### Terms of Service Acknowledgment:
**Required Checkbox:**
```
☐ I understand this Property Due Diligence Report is for 
  informational purposes only and is NOT a substitute for:
  - A formal Land Information Memorandum (LIM)
  - Legal advice
  - Building inspection
  - Valuation report
  
  I will not rely on this report for final settlement decisions.
```

---

## Output Delivery Preferences

### Collect At Input Stage:
| Preference | Options | Default |
|------------|---------|---------|
| **Delivery Method** | Email/WhatsApp/Download Link | Email |
| **Report Format** | PDF/Interactive Web Page/Both | PDF + Web |
| **Detail Level** | Summary/Standard/Comprehensive | Standard |
| **Turnaround** | Instant/Within 4hrs/Same Day | Instant (automated) |
| **Follow-up** | None/15-min Call/Full Consultation | None |

---

## Sample Intake Forms

### Minimal Version (Web Widget):
```html
<form>
  <label>Property Address*</label>
  <input type="text" placeholder="123 Smith Street" required>
  
  <label>Suburb*</label>
  <input type="text" placeholder="Marewa" required>
  
  <label>City*</label>
  <select required>
    <option value="">Select...</option>
    <option value="napier">Napier</option>
    <option value="hastings">Hastings</option>
    <option value="other">Other (specify)</option>
  </select>
  
  <label>Email*</label>
  <input type="email" placeholder="you@example.com" required>
  
  <button type="submit">Generate Report - $75 NZD</button>
  
  <p><small>
    ⚠️ This is an informational report, not a legal LIM. 
    See our Terms for details.
  </small></p>
</form>
```

### Comprehensive Version (Agent Portal):
```html
<form>
  <!-- Section 1: Property Details -->
  <h3>Property Information</h3>
  <input type="text" placeholder="Full Address*" required>
  <input type="text" placeholder="Suburb*" required>
  <input type="text" placeholder="Postcode">
  <select>
    <option>Residential</option>
    <option>Commercial</option>
    <option>Industrial</option>
    <option>Land Only</option>
  </select>
  
  <!-- Section 2: Client Context -->
  <h3>Your Situation</h3>
  <select>
    <option>I'm buying</option>
    <option>I'm selling</option>
    <option>I'm an investor</option>
    <option>Just researching</option>
  </select>
  
  <textarea placeholder="Any specific concerns? (e.g., flood risk, unconsented work, development potential)"></textarea>
  
  <!-- Section 3: Delivery -->
  <h3>Report Delivery</h3>
  <input type="email" placeholder="Email address*" required>
  <input type="tel" placeholder="Phone (optional)">
  <select>
    <option>Standard Report ($75)</option>
    <option>+ Comparable Analysis (+$50)</option>
    <option>+ Investment Metrics (+$50)</option>
    <option>Full Package ($150)</option>
  </select>
  
  <!-- Section 4: Legal -->
  <label>
    <input type="checkbox" required>
    I agree to the Terms of Service and understand this is not a legal LIM
  </label>
  
  <button type="submit">Proceed to Payment</button>
</form>
```

---

## Pricing Tiers Based on Inputs

### Tier 1: Basic Report ($75 NZD)
**Inputs Required:** Address, Suburb, City, Email  
**Includes:**
- LINZ data (title, boundaries, ownership)
- Basic council GIS layers (zoning, hazards)
- Rates information
- 5-7 page PDF

**Turnaround:** Instant (automated)

---

### Tier 2: Standard Report ($125 NZD)
**Inputs Required:** All Tier 1 + Property Type + Intended Use  
**Includes:** Everything in Tier 1 PLUS:
- Enhanced hazard analysis
- Zoning permitted activities summary
- Development potential flags
- Investment metrics (if purchase price provided)
- 10-12 page PDF + interactive web version

**Turnaround:** Within 1 hour

---

### Tier 3: Premium Report ($200-$300 NZD)
**Inputs Required:** All Tier 2 + Comparables + Specific Concerns  
**Includes:** Everything in Tier 2 PLUS:
- Comparable property analysis (3-5 recent sales)
- Custom research on flagged concerns
- Rental yield projections
- Renovation cost estimates (high-level)
- 15-20 page PDF + web version + 15-min consultation call

**Turnaround:** Within 4 hours (business days)

---

## Next Steps for Implementation

1. **Build MVP Intake Form** (Google Forms or Typeform to start)
   - Test with 5-10 properties
   - Refine questions based on feedback

2. **Create Input Validation Logic**
   - LINZ Address Points API integration
   - Auto-detect council district
   - Handle edge cases gracefully

3. **Design Report Templates**
   - Tier 1, 2, 3 versions
   - Consistent branding (AI Driven)
   - Clear disclaimers prominent

4. **Set Up Payment Processing**
   - Stripe integration for web form
   - Manual invoicing option for agents
   - GST handling

5. **Test End-to-End Flow**
   - Submit test requests
   - Verify API calls succeed
   - Check report accuracy against real LIMs
   - Get feedback from beta users (agents, investors)

---

## Competitive Comparison

| Feature | Our Due Diligence Report | Formal LIM | Trade Me Property Insights |
|---------|-------------------------|------------|----------------------------|
| **Price** | $75-$300 | $300-$450 | Free (basic) |
| **Turnaround** | Instant - 4hrs | 5-10 days | Instant |
| **Legal Protection** | ❌ No | ✅ Yes | ❌ No |
| **Building Consents** | Partial (locations only) | ✅ Full details | ❌ None |
| **Hazards** | ✅ Yes (council GIS) | ✅ Yes | ⚠️ Limited |
| **Zoning** | ✅ Yes | ✅ Yes | ⚠️ Basic |
| **Ownership** | ✅ Yes (LINZ titles) | ✅ Yes | ❌ No |
| **Customization** | ✅ Tiered options | ❌ Standard only | ❌ None |

**Our Differentiator:** Speed + Depth + Affordability for screening stage

---

**Document Status:** Draft v1.0  
**Created:** 2026-08-04  
**Owner:** AI Driven (Gerhard Stimie)  
**Next Review:** After first 10 paid reports delivered
