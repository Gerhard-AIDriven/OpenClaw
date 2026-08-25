# SPAR Sigma Product Analysis Scenarios

## Overview

Three standardized analysis scenarios for any SPAR Sigma department. All use the same underlying data format and can be run using the template framework.

**Data Format:** Excel files with 49 months (March 2022 – March 2026), 5 columns per month (Sales VAT, Sales Qty, Gross Profit, GP Ratio %, GP %)

---

## Scenario 1: Identify Good Performers (Trend Analysis)

**Purpose:** Find products with upward momentum in both sales volume AND profitability

**Analysis Type:** Dual-positive trend analysis using linear regression slopes

### Key Metrics
- **Sales Quantity Slope** (units/month trend)
- **GP% Slope** (profitability improvement/month)

### Selection Criteria
✅ **INCLUDE products where:**
- Sales Quantity slope > 0 (volume increasing)
- AND GP% slope > 0 (margin improving)

❌ **EXCLUDE products where:**
- Either metric is flat or negative
- Total sales volume < 100 units (49-month period)

### Output Categories
- **Exceptional Performers:** Both slopes > 50th percentile
- **Good Performers:** Both slopes positive
- **Top by Volume:** Highest cumulative sales
- **Top by Margin Improvement:** Highest GP% slope

### Business Action
✓ **EXPAND:** Increase shelf space, promote, stock more frequently
✓ **REPLICATE:** Bundle with complementary products, create variation packs
✓ **FEATURE:** Marketing, seasonal promotions, tie-ins

### Report Structure
1. Executive summary with top performers
2. Detailed trend table (all flagged products with slopes)
3. Strategic recommendations by category
4. Complete appendix with all 200 products and slopes

### Example Output
```
Top Performer: Pork Shoulder Braai Chops (63470)
  Qty Slope: +9.10 units/month
  GP% Slope: +9.10 percentage points/month
  Action: EXPAND & PROMOTE
```

---

## Scenario 2: Identify Bad Performers (Trend Analysis)

**Purpose:** Find products with declining sales OR declining profitability or BOTH

**Analysis Type:** Dual-negative or mixed-negative trend analysis

### Key Metrics
- **Sales Quantity Slope** (units/month trend)
- **GP% Slope** (profitability trend)

### Selection Criteria
✅ **INCLUDE products where:**
- Sales Quantity slope ≤ 0 (volume declining/flat)
- OR GP% slope ≤ 0 (margin declining/flat)
- OR both declining

### Culling Priority Tiers
**Tier 1 (Critical - Cull Immediately):**
- Both metrics negative AND total sales < 1,000 units
- Volume decline > 50% AND margin decline > 0.5 pts
- Example: 1/4 Lamb (-87.8% qty, -2.39 GP%)

**Tier 2 (Review - Consolidate/Phase Out):**
- One metric negative, other flat/positive
- Total sales 1,000–3,000 units
- Margin weak (< 1%)

**Tier 3 (Monitor - Slow Movers):**
- Both positive but very weak slopes (< 0.3 units/mo, < 0.01% GP/mo)
- Opportunity cost of shelf space too high
- Example: BULK OUKRANS BOEREWORS (+0.32 qty/mo, +0.0013% GP/mo)

### Business Action
🔴 **CULL:** Remove from system, clear shelf space (Tier 1)
🟡 **CONSOLIDATE:** Merge variants, bundle with winners (Tier 2)
⚠️ **MONITOR:** Review in 6 months, plan phase-out (Tier 3)

### Report Structure
1. Executive summary with cull metrics
2. Culling categories and justification
3. Impact analysis (complexity reduction, cash freed)
4. Implementation roadmap (Phase 1, 2, 3)
5. Complete product listing with tier assignments

### Example Output
```
TIER 1 - CRITICAL (3 products):
  1/4 Lamb (32041): Qty -87.8%, GP% -2.39 pts → CULL IMMEDIATELY
  Cheese Burger (45832): Qty -100%, GP% -0.01 pts → DEAD STOCK
  Kasegriller M/Club (45416): Qty -10.9%, GP% -0.43 pts → CULL IMMEDIATELY
```

---

## Scenario 3: Identify Bad Performers (Dormancy Analysis)

**Purpose:** Find products with no recent sales activity (regardless of historical trends)

**Analysis Type:** Time-based activity status classification

### Key Metrics
- **Last Month with Sales > 0** (most recent activity)
- **Months Since Last Sale** (dormancy period)

### Selection Criteria
✅ **STATUS CLASSIFICATION:**

| Status | Months Since Last Sale | Action |
|--------|------------------------|--------|
| ACTIVE | 0–2 months (Feb–Mar 2026) | Monitor, maintain stock |
| RECENT | 3–4 months (Dec 2025–Jan 2026) | Review demand, monitor closely |
| STALE | 5–12 months | Plan phase-out, monitor |
| DEAD STOCK | 12+ months (mid-2024 or earlier) | **CULL IMMEDIATELY** |

### Culling Priority
**DEAD STOCK (21 products):** Last sale 12+ months ago
- Strong candidates for immediate removal
- Consuming shelf space with zero benefit
- Simplifies inventory management

**STALE (53 products):** Last sale 5–12 months ago
- Monitor closely over next 6 months
- Plan consolidation or removal if no improvement

### Business Action
🔴 **CULL:** Remove from inventory (DEAD STOCK)
⚠️ **MONITOR:** Watch for improvement (STALE)
✓ **MAINTAIN:** Continue stocking (ACTIVE & RECENT)

### Report Structure
1. Executive summary with status distribution
2. Product breakdown by status (4 tables)
3. Data notes and methodology
4. Complete product listing by status

### Example Output
```
ACTIVE Products: 111 (55.5%) — Feb–Mar 2026
RECENT Products: 15 (7.5%) — Dec 2025–Jan 2026
STALE Products: 53 (26.5%) — 5–12 months ago
DEAD STOCK Products: 21 (10.5%) — 12+ months ago ← CULL CANDIDATES
```

---

## Comparison: When to Use Each Scenario

| Scenario | When to Use | Key Question | Output Focus |
|----------|------------|---|---|
| **Scenario 1: Trend (Good)** | Growth planning, product development, promotions | "Which products are winning?" | Winners, expansion opportunities |
| **Scenario 2: Trend (Bad)** | Culling decisions, SKU rationalization | "Which products are losing momentum?" | Poor performers, cull tiers |
| **Scenario 3: Dormancy** | Quick cull assessment, space optimization | "Which products have been abandoned?" | Activity status, culling candidates |

**Complementary Use:**
- Run **Scenario 1** to identify expansion candidates
- Run **Scenario 2** to identify trend-based culls
- Run **Scenario 3** to identify dormancy-based culls
- **Combine findings:** Remove Scenario 2 Tier 1 + Scenario 3 DEAD STOCK products

---

## Quick Start: Request Analysis by Department

To analyze any department, provide Gerhard with:

```
Department: [Department Name]
Scenario: [1, 2, or 3]
Input File: "Spar/Data Extracts/gws [department].xls"
```

### Example Requests

**Request 1:**
```
Department: Produce
Scenario: 1 (Good Performers)
File: gws produce.xls
→ Find expansion candidates in produce
```

**Request 2:**
```
Department: Deli
Scenario: 2 (Bad Performers - Trend)
File: gws deli.xls
→ Identify Deli products to cull based on trends
```

**Request 3:**
```
Department: Dairy
Scenario: 3 (Bad Performers - Dormancy)
File: gws dairy.xls
→ Find dormant/dead stock in dairy
```

---

## Scripts & Templates Available

### For Scenario 1: Good Performer Trend Analysis
**Script:** `analyze_uptrend_products.js` (or equivalent)
**Output:** JSON with slopes, HTML report with top 20 + appendix

### For Scenario 2: Bad Performer Trend Analysis
**Script:** `analyze_downtrend_products.js` (or equivalent)
**Output:** JSON with tier assignments, HTML report with cull categories

### For Scenario 3: Dormancy Analysis
**Script:** `extract_product_status_template.js`
**Output:** JSON with status classification, HTML report by status

---

## Data Validation Checklist

Before running any scenario, verify the input file has:

- [ ] Row 0: Month headers in D/MM/YY format (01/01/26, 01/02/26, etc.)
- [ ] Row 1: Column headers (Sales incl VAT, Sales Quantity, Gross Profit, GP Ratio %, GP %)
- [ ] Rows 2+: Product data with Code, Description, Department, and monthly values
- [ ] 5 columns per month (VAT, Qty, GP, Ratio, %)
- [ ] 49 months of data (March 2022 – March 2026)
- [ ] No merged cells or unusual formatting

---

## Storage

**Location:** `C:\Users\gstim\.openclaw\workspace\`

**Files:**
- `PRODUCT_ANALYSIS_SCENARIOS.md` — This document (scenario definitions)
- `extract_product_status_template.js` — Reusable script for all scenarios
- `PRODUCT_STATUS_TEMPLATE_README.md` — Script documentation
- `butchery_uptrend_analysis_revised.json` — Example Scenario 1 output
- `butchery_cull_candidates_report.html` — Example Scenario 2 output
- `butchery_product_status_report_CORRECTED.html` — Example Scenario 3 output

---

## Notes for Future Use

1. **Same Data Format:** All three scenarios work because the underlying SPAR Sigma file format is consistent across departments.

2. **Customizable Thresholds:** Each scenario has adjustable parameters (e.g., minimum sales, slope percentiles, dormancy periods). Modify in the script CONFIG if needed.

3. **Combining Insights:** For maximum impact, run all three scenarios on a department and cross-reference findings:
   - Products flagged in Scenario 1 → EXPAND
   - Products flagged in both Scenario 2 & 3 → CULL with confidence
   - Products in Scenario 3 STALE → Monitor in next Scenario 1/2 run

4. **Timing:** Run quarterly or bi-annually to track trends and validate earlier recommendations.

---

## Version History

- **v1.0** (2026-04-18): Initial scenario definitions based on Butchery analysis
  - Scenario 1: Trend analysis (uptrend — good performers)
  - Scenario 2: Trend analysis (downtrend — bad performers)
  - Scenario 3: Dormancy analysis (last sales activity)
  - Template supports all three with same data format
