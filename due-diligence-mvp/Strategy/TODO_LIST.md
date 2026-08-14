# AI Driven Due Diligence - Master TODO List

**Last Updated:** 2026-08-14  
**Priority:** 🔴 Critical | 🟡 Important | 🟢 Nice-to-Have  

---

## 🎯 Strategic Decisions (Pending Your Review)

### Pricing & Positioning
- [ ] **Review and approve product pricing:**
  - [ ] LIM + Analysis: NZD $179+ (service fee $69 + council fees)
  - [ ] Basic Report: NZD $79
  - [ ] Standard Report: NZD $249
  - [ ] Advanced Report: NZD $449
- [ ] **Confirm LIM positioning:** Loss leader for acquisition + market intel?
- [ ] **Approve bundle pricing:**
  - [ ] First-Time Buyer Pack (Basic + LIM): $239
  - [ ] Investor Pack (5x Basic): $349
  - [ ] Full Due Diligence (Standard + LIM): $379
- [ ] **Decide on regional pricing model for LIM:**
  - [ ] Option A: Flat $179 (absorb high council fees as marketing cost)
  - [ ] Option B: Service fee + pass-through council fees (transparent)
  - [ ] Option C: Tiered by region (Zone 1/2/3 pricing)

### Product Specifications
- [ ] **Define exact data sources for each tier:**
  - [ ] Basic: Which APIs/databases? (LINZ, OneSearch, council rating DBs?)
  - [ ] Standard: Which council portals to integrate first?
  - [ ] Advanced: What manual research steps exactly?
- [ ] **Approve report templates:**
  - [ ] Basic: 3-5 page automated PDF
  - [ ] Standard: 5-page summary + risk flags
  - [ ] Advanced: 10-page comprehensive + consultation call
  - [ ] LIM Analysis: 10-page expert interpretation template

### Channel Strategy
- [ ] **Confirm WhatsApp role:**
  - [ ] Primary channel for LIM + Basic only?
  - [ ] Qualification channel for Standard/Advanced (route to website)?
- [ ] **Website scope:**
  - [ ] MVP: All 4 products + payment gateway
  - [ ] Phase 2: Account creation, order history, upsells
  - [ ] Phase 3: API integrations, instant reports

---

## 📋 Phase 1: Foundation (Week 1-2)

### Documentation & Planning
- [x] ✅ Create workflow documentation (WORKFLOW.md)
- [x] ✅ Create visual workflow diagram (WORKFLOW-DIAGRAM.html)
- [x] ✅ Create product strategy document (PRODUCT_STRATEGY_NZD.md)
- [ ] **Create detailed product spec sheets:**
  - [ ] Basic Report specification (exact fields, data sources, output format)
  - [ ] Standard Report specification
  - [ ] Advanced Report specification
  - [ ] LIM Analysis specification (10-page template structure)
- [ ] **Competitive analysis document:**
  - [ ] OneSearch.co.nz deep-dive (what they offer, gaps)
  - [ ] Council property file comparison (pricing, delivery, format)
  - [ ] Builder/home inspector services (what they cover, pricing)
  - [ ] Legal due diligence services (lawyer offerings, hourly rates)
- [ ] **Council fee research:**
  - [ ] Napier City Council LIM fees (call/website research)
  - [ ] Hastings District Council LIM fees
  - [ ] Central Hawke's Bay, Wairoa fees
  - [ ] Create master spreadsheet: All NZ councils, fees, turnaround times, submission methods

### Technical Setup - WhatsApp (Already Live!)
- [x] ✅ WhatsApp Business API configured
- [x] ✅ Cloudflare Worker deployed (webhooks, KV store)
- [x] ✅ OpenClaw polling every 3 minutes
- [x] ✅ Auto-reply system working (tested with Sonia's message)
- [ ] **Update WhatsApp scripts for new pricing:**
  - [ ] Update poll-whatsapp-requests-v2.js with LIM + Analysis messaging
  - [ ] Add dynamic pricing logic (address → council → quote)
  - [ ] Update auto-reply templates (value prop, not just confirmation)
- [ ] **Add payment link generation:**
  - [ ] Integrate payment gateway (PayFast/Stripe decision needed)
  - [ ] Generate unique checkout URLs per order
  - [ ] Test payment flow end-to-end

### Technical Setup - Website MVP
- [ ] **Domain & hosting:**
  - [ ] Decide: due-diligence.aidriven.biz (subdomain) vs aidriven.biz/due-diligence (subfolder)
  - [ ] Set up Cloudflare Pages project
  - [ ] Configure DNS records
- [ ] **Build landing pages:**
  - [ ] Homepage (hero, value prop, 4-product comparison table)
  - [ ] Product page: LIM + Analysis (features, benefits, pricing, FAQs)
  - [ ] Product page: Basic Report
  - [ ] Product page: Standard Report
  - [ ] Product page: Advanced Report
  - [ ] About page (who we are, why trust us)
  - [ ] Contact/Support page
- [ ] **Payment integration:**
  - [ ] Choose payment gateway (PayFast vs Stripe vs Yoco)
  - [ ] Create merchant account
  - [ ] Implement checkout flow
  - [ ] Add payment webhooks (confirm payment → trigger report generation)
- [ ] **Order management:**
  - [ ] Simple database (Cloudflare KV or Airtable)
  - [ ] Order tracking page (customer enters email → see status)
  - [ ] Admin dashboard (view all orders, mark complete)

### Report Generation System
- [ ] **Basic Report (Automated):**
  - [ ] Build HTML template (professional design, AI Driven branding)
  - [ ] Integrate data sources (which APIs?)
  - [ ] PDF generation (html-pdf-node already tested ✅)
  - [ ] Automated delivery (email + download link)
- [ ] **Standard Report (Semi-Automated):**
  - [ ] Build HTML template (more detailed sections)
  - [ ] Data collection automation (70% of data via APIs)
  - [ ] Manual review checklist (what human verifies?)
  - [ ] PDF generation + email delivery
- [ ] **Advanced Report (Manual + Expert):**
  - [ ] Build comprehensive template (10 pages)
  - [ ] Research checklist (step-by-step manual process)
  - [ ] Consultation call scheduling system (Calendly integration?)
  - [ ] Quality assurance process (peer review before delivery)
- [ ] **LIM Analysis Report:**
  - [ ] Create 10-page expert analysis template
  - [ ] Define analysis framework (how to interpret LIM sections)
  - [ ] Risk flagging system (🚨 Critical, ⚠️ Monitor, ✅ Clear)
  - [ ] Recommendation library (common scenarios → standard advice)

---

## 🚀 Phase 2: Launch Preparation (Week 2-3)

### Marketing Materials
- [ ] **Website copy:**
  - [ ] Homepage hero (headline, subhead, CTA)
  - [ ] Product descriptions (benefits, not just features)
  - [ ] FAQ section (top 20 questions per product)
  - [ ] Testimonials (get 3-5 beta customers first)
- [ ] **WhatsApp message templates:**
  - [ ] Initial inquiry response (value prop + pricing)
  - [ ] Payment reminder (if customer abandons checkout)
  - [ ] Order confirmation
  - [ ] Delivery message (report ready + download link)
  - [ ] Follow-up upsell (want Standard instead of Basic?)
- [ ] **Email templates:**
  - [ ] Order confirmation email
  - [ ] Report delivery email
  - [ ] Post-purchase survey (NPS, feedback)
  - [ ] Upsell email (upgrade to next tier)
- [ ] **Social media content:**
  - [ ] Facebook page setup
  - [ ] LinkedIn company page
  - [ ] 10-15 launch posts (property tips, case studies, behind-the-scenes)

### Beta Testing
- [ ] **Recruit 5-10 beta customers:**
  - [ ] Friends/family (free or heavily discounted)
  - [ ] Real estate agent partners (offer free reports for their clients)
  - [ ] Property investor groups (Facebook groups, local meetups)
- [ ] **Test each product:**
  - [ ] LIM + Analysis: 2-3 beta tests
  - [ ] Basic Report: 3-5 beta tests
  - [ ] Standard Report: 2-3 beta tests
  - [ ] Advanced Report: 1-2 beta tests (time-intensive)
- [ ] **Gather feedback:**
  - [ ] Report clarity (was it easy to understand?)
  - [ ] Value for money (did they feel it was worth the price?)
  - [ ] Turnaround time (met expectations?)
  - [ ] What would they improve?
  - [ ] Would they recommend to others?
- [ ] **Iterate based on feedback:**
  - [ ] Refine report templates
  - [ ] Adjust pricing if needed
  - [ ] Fix any technical bugs
  - [ ] Improve messaging/positioning

### Partnerships
- [ ] **Real estate agents:**
  - [ ] Identify 10-20 target agencies in Hawke's Bay
  - [ ] Create partnership proposal (referral commission? bulk discounts?)
  - [ ] Schedule meetings/presentations
  - [ ] Onboard first 3-5 partner agencies
- [ ] **Mortgage brokers:**
  - [ ] Identify 5-10 brokers
  - [ ] Pitch: "Help your clients make informed offers"
  - [ ] Offer affiliate commission (10-15% per referral)
- [ ] **Builders/home inspectors:**
  - [ ] Identify complementary (not competitive) builders
  - [ ] Partnership: "We do legal/planning, you do physical inspection"
  - [ ] Cross-referral agreement

---

## 🎉 Phase 3: Launch (Week 4)

### Soft Launch (Week 4, Days 1-3)
- [ ] Go live with website (quiet launch, no marketing yet)
- [ ] Test all systems with real (paying) customers
- [ ] Monitor for bugs/issues
- [ ] Gather initial testimonials

### Official Launch (Week 4, Days 4-7)
- [ ] **Facebook/Instagram ads:**
  - [ ] Create ad creatives (property images, compelling copy)
  - [ ] Target: NZ property investors, first-home buyers, people interested in TradeMe Property
  - [ ] Budget: $20-30/day initially
  - [ ] Track conversions (cost per acquisition)
- [ ] **Google Ads:**
  - [ ] Keywords: "LIM report Napier", "property due diligence NZ", "house check before buying"
  - [ ] Landing pages optimized for each keyword
  - [ ] Budget: $30-50/day
- [ ] **Content marketing:**
  - [ ] Publish 3 blog posts (SEO-optimized):
    - "How to Read a LIM Report: Complete Guide for NZ Buyers"
    - "10 Red Flags to Look for Before Buying a House in Napier"
    - "Due Diligence Checklist: What Every NZ Property Buyer Needs"
  - [ ] Share in Facebook property groups
  - [ ] Submit to property investment forums
- [ ] **PR/Media:**
  - [ ] Press release: "AI Driven Launches Automated Due Diligence Service in Hawke's Bay"
  - [ ] Pitch to local newspapers (Hawke's Bay Today, Dominion Post)
  - [ ] Radio interviews (Local iwi radio, Magic Talk)

---

## 📈 Phase 4: Optimization & Scale (Month 2-3)

### Automation Improvements
- [ ] **Increase Basic Report automation:**
  - [ ] Current: 95% → Target: 99%
  - [ ] Eliminate remaining manual steps
- [ ] **Increase Standard Report automation:**
  - [ ] Current: 70% → Target: 85%
  - [ ] Automate council data scraping (where allowed)
  - [ ] Build LINZ API integration
  - [ ] Auto-generate risk flags based on data patterns
- [ ] **Advanced Report efficiency:**
  - [ ] Create research templates/checklists
  - [ ] Build database of common findings (faster analysis)
  - [ ] Delegate 50% of manual work to VA

### Team Building
- [ ] **Hire part-time Virtual Assistant:**
  - [ ] Job description: LIM processing, Standard report drafting, customer support
  - [ ] Hours: 10-20 hours/week initially
  - [ ] Pay rate: NZD $20-25/hour (Philippines-based VA)
  - [ ] Training: Create SOPs, video tutorials
- [ ] **Hire freelance writer:**
  - [ ] For blog content, report writing (Advanced tier)
  - [ ] Property/real estate background preferred
  - [ ] Pay per article/report

### Product Expansion
- [ ] **Rental Compliance Reports:**
  - [ ] Market: Landlords needing Healthy Homes compliance
  - [ ] Price point: NZD $149-199
  - [ ] Data sources: Tenancy Services, insulation databases
- [ ] **Commercial Due Diligence:**
  - [ ] Market: Commercial property investors
  - [ ] Price point: NZD $799-1,499
  - [ ] Additional data: zoning, resource consents, environmental
- [ ] **Subscription Product:**
  - [ ] Market: Serious property investors (5+ properties/year)
  - [ ] Price: NZD $99/month for unlimited Basic reports
  - [ ] Includes: Priority support, quarterly market updates

### Geographic Expansion
- [ ] **Phase 1: Hawke's Bay Only** (Launch market)
- [ ] **Phase 2: North Island Major Cities** (Month 3-4)
  - [ ] Auckland
  - [ ] Hamilton
  - [ ] Tauranga
  - [ ] Wellington
- [ ] **Phase 3: Nationwide Coverage** (Month 5-6)
  - [ ] All NZ councils covered
  - [ ] Marketing: Nationwide campaigns

---

## 🛡️ Risk Management & Compliance

### Legal
- [ ] **Terms of Service:**
  - [ ] Draft with lawyer (disclaimers, limitations of liability)
  - [ ] Clearly state: "Not a substitute for professional advice"
  - [ ] Define refund policy
- [ ] **Privacy Policy:**
  - [ ] GDPR/NZ Privacy Act compliant
  - [ ] Data retention policies
  - [ ] Customer data usage disclosure
- [ ] **Intellectual Property:**
  - [ ] Trademark "AI Driven" name/logo
  - [ ] Copyright report templates
  - [ ] Protect proprietary analysis frameworks

### Insurance
- [ ] **Professional Indemnity Insurance:**
  - [ ] Get quotes (NZ insurers)
  - [ ] Coverage: $1-2 million
  - [ ] Cost: ~$2,000-4,000/year
- [ ] **Cyber Liability Insurance:**
  - [ ] In case of data breach
  - [ ] Coverage: $500k-1M

### Data Security
- [ ] **Secure customer data:**
  - [ ] Encrypt database
  - [ ] Secure file storage (reports contain personal info)
  - [ ] Access controls (who can view customer data?)
- [ ] **Backup systems:**
  - [ ] Daily automated backups
  - [ ] Off-site backup location
  - [ ] Disaster recovery plan

---

## 📊 Metrics & Reporting

### Weekly Dashboard (Track Every Monday)
- [ ] Total orders (by product)
- [ ] Revenue (by product)
- [ ] Conversion rate (website visitors → paying customers)
- [ ] Average order value
- [ ] Customer acquisition cost (ad spend / new customers)
- [ ] Turnaround time (actual vs. target)
- [ ] Customer support tickets (volume, resolution time)

### Monthly Review (First Monday of Each Month)
- [ ] Revenue vs. target
- [ ] Gross margin % (by product)
- [ ] Customer lifetime value
- [ ] Net Promoter Score (from surveys)
- [ ] Repeat customer rate
- [ ] Top traffic sources (which marketing channels work?)
- [ ] Product feedback themes (what customers love/hate)

---

## 🧠 Learning & Development

### Gerhard's Focus Areas
- [ ] **Deep-dive into LIM reports:**
  - [ ] Order 5-10 sample LIMs from different councils
  - [ ] Analyze structure, common sections, jargon
  - [ ] Build interpretation framework
- [ ] **Property due diligence expertise:**
  - [ ] Read NZ property investment books
  - [ ] Study council district plans
  - [ ] Understand building consent processes
  - [ ] Learn about natural hazards (flood, erosion, liquefaction)
- [ ] **Automation/AI skills:**
  - [ ] Advanced API integrations
  - [ ] Web scraping techniques (ethical, legal)
  - [ ] PDF generation optimization
  - [ ] Natural language processing for report writing

### Team Training
- [ ] **VA Training Program:**
  - [ ] LIM processing SOP
  - [ ] Standard report drafting guidelines
  - [ ] Customer service scripts
  - [ ] Quality assurance checklist
- [ ] **Ongoing Education:**
  - [ ] Weekly team meeting (lessons learned, process improvements)
  - [ ] Monthly industry update (new council regulations, market trends)

---

## 🎯 Success Milestones

### Month 1 Goals
- [ ] Website live and accepting orders
- [ ] 10 paying customers (any product mix)
- [ ] Revenue: $3,000-5,000
- [ ] NPS score: 8.0+ (customers love it!)
- [ ] Zero major bugs/complaints

### Month 3 Goals
- [ ] Revenue: $13,000+/month (run rate $150k+/year)
- [ ] 50+ total customers served
- [ ] 3 real estate agency partnerships active
- [ ] Standard report 80% automated
- [ ] Hire first VA (part-time)

### Month 6 Goals
- [ ] Revenue: $20,000+/month (run rate $240k+/year)
- [ ] Nationwide coverage (all NZ councils)
- [ ] 200+ total customers served
- [ ] Launch subscription product
- [ ] Explore Australia market feasibility

### Year 1 Goals
- [ ] Revenue: $300,000+ (full year)
- [ ] Team: Gerhard + 2-3 VAs + 1-2 contractors
- [ ] Market leader in NZ property due diligence
- [ ] Expand to commercial/rental products
- [ ] Consider Series A funding or strategic partnership

---

## 📝 Notes & Ideas

### Product Ideas to Explore
- [ ] **Development Feasibility Reports:** For developers (zoning analysis, yield calculations, profit projections)
- [ ] **Body Corp Due Diligence:** For apartment buyers (meeting minutes, financials, leaky building checks)
- [ ] **Rural Property Reports:** Lifestyle blocks, farms (water rights, soil quality, subdivision potential)
- [ ] **Cross-Lease Reports:** Specific to cross-lease properties (flat plans, shared ownership issues)
- [ ] **Unit Title Reports:** For apartments (body corp health, sinking fund adequacy)

### Marketing Ideas
- [ ] **YouTube Channel:** "Property Due Diligence Explained" series
- [ ] **Podcast:** Interview property investors, share case studies
- [ ] **Free Tools:** "Instant Property Value Estimator" (lead magnet)
- [ ] **Webinars:** Monthly "How to Buy Property Safely in NZ" training
- [ ] **Referral Program:** Existing customers get $20 credit for each referral who buys

### Technology Ideas
- [ ] **Browser Extension:** One-click due diligence while browsing TradeMe Property
- [ ] **API for Real Estate Agencies:** White-label our reports for their websites
- [ ] **Mobile App:** iOS/Android app for property researchers on-the-go
- [ ] **Machine Learning:** Predictive analytics (which properties are likely to have issues?)

---

*AI Driven | Practical AI for real businesses*  
*This is a living document – update weekly as priorities shift*
