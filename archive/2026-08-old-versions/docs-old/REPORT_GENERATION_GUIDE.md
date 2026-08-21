# Due Diligence Report Generation Guide

## Overview

The Due Diligence MVP now generates professional HTML reports with:
- ✅ Property title details
- ✅ Address verification
- ✅ Location map (SVG)
- ✅ Professional formatting with AI Driven branding
- ✅ Legal disclaimers and LINZ attribution

**Report Generation Time:** ~2.5 seconds per property  
**Output Format:** HTML (viewable in any browser)

---

## Quick Start

### Option 1: Generate Report for Test Address
```bash
cd C:\Users\gstim\.openclaw\workspace\due-diligence-mvp
python generate-report.py
```

### Option 2: Generate Report for Custom Address
```bash
python generate-report.py "31" "Douglas McLean Avenue" "Marewa"
```

### Option 3: Programmatic Usage
```python
from cached_query import query_title_by_address
from report_generator import generate_html_report

# Query property
result = query_title_by_address(
    address_number='31',
    road_name='Douglas McLean Avenue',
    suburb='Marewa',
    use_cache=True
)

# Generate report
html, report_path = generate_html_report(result)
print(f"Report saved to: {report_path}")
```

---

## Output Files

### Generated Reports
Location: `due-diligence-mvp/reports/`

Files are named: `report-{TITLE_NO}-{TIMESTAMP}.html`

Example: `report-HBE2-765-20260807-174438.html`

### JSON Data
Location: `due-diligence-mvp/due-diligence-result.json`

Contains structured data for further processing or integration.

---

## Report Contents

### Section 1: Property Address
- Full formatted address
- GPS coordinates (lat/lon)

### Section 2: Title Details
- **Title Number** (e.g., HBE2/765)
- **Status** (LIVE/CANCELLED)
- **Land District** (e.g., Hawkes Bay)
- **Issue Date**
- **Estate Type** (Freehold/Cross-lease/etc.)
- **Guarantee Status**
- **Area** (automatically extracted in m²)
- **Number of Owners**
- **Full Estate Description**

### Section 3: Location Map
- SVG map showing approximate property location
- Address point marker (gold circle)
- Property boundary placeholder (dashed ellipse)
- North arrow
- Scale bar (~100m)
- Coordinates display

*Note: Current map is schematic. Phase 2 will add actual property boundaries from LINZ parcel data.*

### Section 4: Disclaimer
- Legal disclaimer (not survey-accurate, verify with solicitor)
- LINZ data attribution (Creative Commons 4.0)
- AI Driven contact information

---

## Customization

### Branding Colors
Edit `report_generator.py` CSS section:
- Primary green: `#007A4D` (AI Driven brand)
- Accent gold: `#FFB81C` (AI Driven brand)
- Charcoal: `#2D2D2D` (text)

### Report Template
Modify the HTML template in `generate_html_report()` function to:
- Add company logo
- Change layout
- Include additional fields
- Add watermarks

### Map Styling
Edit `_generate_location_map()` function to:
- Change colors
- Adjust scale
- Modify markers
- Add custom annotations

---

## Future Enhancements (Phase 2+)

### Planned Features:
1. **Real Property Boundaries**
   - Fetch parcel polygon from LINZ Layer 51571
   - Draw accurate boundary on map
   - Calculate exact area

2. **Building Outlines**
   - Overlay building footprints (Layer 51604)
   - Show count and approximate sizes

3. **Interactive Maps**
   - Leaflet.js with LINZ WMTS tiles
   - Zoom/pan functionality
   - Aerial photo layer toggle

4. **Nearby Amenities**
   - Schools (Ministry of Education API)
   - Hospitals (HealthPoints dataset)
   - Shops/services (OpenStreetMap)
   - Distance calculations

5. **PDF Export**
   - Convert HTML to PDF
   - Printable format
   - Email-ready attachments

6. **Batch Reports**
   - Process CSV of addresses
   - Generate multiple reports
   - Summary comparison sheet

---

## Troubleshooting

### "Cache database not found"
Run: `python build-cache-hawkes-bay.py` first

### "No titles found at this location"
- Address may be vacant land
- Check if address exists in LINZ Addresses layer
- Try nearby address numbers

### "Map shows incorrect location"
Current map is schematic only. Phase 2 will use actual geometry.

### Report formatting looks wrong
- Open in modern browser (Chrome, Edge, Firefox)
- Ensure UTF-8 encoding
- Check CSS loaded properly (F12 Developer Tools)

---

## Performance

| Operation | Time |
|-----------|------|
| Address geocoding | ~2s (live API) |
| Title lookup | <0.01s (cached) |
| Report generation | <0.5s |
| **Total** | **~2.5s** |

---

## Example Use Cases

### 1. Pre-Offer Due Diligence
- Quick title check before making offer
- Verify ownership and area
- Identify easements/covenants (future enhancement)

### 2. Settlement Verification
- Confirm title details match agreement
- Verify no last-minute changes
- Generate report for lawyer

### 3. Portfolio Review
- Batch process multiple properties
- Compare title types and areas
- Identify cross-lease vs freehold

### 4. Client Reporting
- Professional HTML report for clients
- Email-ready format
- Branded with your company details

---

## License & Attribution

**Data Source:** LINZ Data Service  
**License:** Creative Commons Attribution 4.0 International  

**Required attribution in reports:**
```
Contains LINZ data © Crown copyright licensed under Creative Commons Attribution 4.0 International
```

---

## Contact

**AI Driven**  
Website: www.aidriven.biz  
Email: gerhard@aidriven.biz  

**Report Generator Version:** 1.0 (Phase 1)  
**Last Updated:** 2026-08-07
