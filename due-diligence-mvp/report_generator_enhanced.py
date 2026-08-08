"""
Due Diligence MVP - Enhanced Report Generator (Tier 1)

Generates professional HTML reports with:
- Property title details
- Location map (Leaflet interactive)
- Hazard overlays (Flood, Tsunami, HAIL)
- Risk assessment summary
- AI Driven branding
"""

import json
from datetime import datetime
from pathlib import Path
import sys

sys.stdout.reconfigure(encoding='utf-8')

# Load AI Driven logo data URI
LOGO_DATA_URI = None
try:
    logo_path = Path(__file__).parent / 'logo-data-uri.txt'
    with open(logo_path, 'r', encoding='utf-8') as f:
        LOGO_DATA_URI = f.read().strip()
except Exception as e:
    print(f"Warning: Could not load logo: {e}")

def generate_enhanced_report(result_data, hazards_data=None, easements_data=None, rates_data=None, output_path=None):
    """
    Generate enhanced HTML report with hazard overlays
    
    Args:
        result_data: Dictionary with address, title, and property info
        hazards_data: Dictionary with hazard assessment results (optional)
        output_path: Path to save HTML file (optional)
    
    Returns:
        HTML string and path to saved file
    """
    
    address = result_data.get('address', {})
    title = result_data.get('title', {})
    buildings = result_data.get('buildings', {})
    
    if not title:
        return _generate_no_result_report(address, hazards_data)
    
    # Extract property data
    full_address = f"{address.get('full_address', 'Address Not Found')}"
    lat = address.get('latitude', 0)
    lon = address.get('longitude', 0)
    coords = f"{lat:.6f}, {lon:.6f}"
    
    # Title data
    title_no = title.get('title_no', 'Unknown')
    status = title.get('status', 'Unknown')
    title_type = title.get('type', 'Unknown')
    estate = title.get('estate', 'Unknown')
    guarantee = title.get('guarantee_status', 'Unknown')
    district = title.get('land_district', 'Unknown')
    issue_date = title.get('issue_date', 'Unknown')
    owners = title.get('number_owners', 'Unknown')
    area = _extract_area(estate)
    
    # Building data
    building_info = buildings.get('primary_building', {}) if buildings else {}
    floor_area = building_info.get('floor_area_m2', None) if building_info else None
    decade_built = building_info.get('decade_built', None) if building_info else None
    
    # Hazard data
    has_hazards = hazards_data is not None
    overall_risk = hazards_data.get('overall_risk_rating', 'unknown') if has_hazards else 'unknown'
    
    # Easements data
    has_easements = easements_data is not None
    easement_count = easements_data.get('summary', {}).get('count', 0) if has_easements else 0
    easement_html = easements_data.get('html_table', '') if has_easements else ''
    
    # Rates data
    has_rates = rates_data is not None
    rates_html = rates_data.get('html_table', '') if has_rates else ''
    rates_summary = rates_data.get('summary', {}) if has_rates else {}
    
    # Build HTML
    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Property Due Diligence Report - {title_no} | AI Driven</title>
    
    <!-- Leaflet CSS -->
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    
    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Rajdhani:wght@500;600;700&display=swap" rel="stylesheet">
    
    <style>
        :root {{
            --green: #007A4D;
            --gold: #FFB81C;
            --charcoal: #2D2D2D;
            --orange: #F7931E;
            --purple: #8B2FC9;
            --border: rgba(255,255,255,0.1);
        }}
        
        * {{ margin: 0; padding: 0; box-sizing: border-box; }}
        body {{ font-family: 'Inter', sans-serif; line-height: 1.6; color: #e0e0e0; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); min-height: 100vh; }}
        
        .container {{ max-width: 1100px; margin: 0 auto; padding: 40px 20px; }}
        
        /* Header */
        .header {{ 
            background: linear-gradient(135deg, var(--charcoal), #1a1a2e); 
            padding: 40px; 
            border-radius: 16px; 
            margin-bottom: 30px;
            border: 2px solid var(--border);
            position: relative;
            overflow: hidden;
        }}
        .header::before {{
            content: '';
            position: absolute;
            top: 0; left: 0; right: 0;
            height: 4px;
            background: linear-gradient(90deg, var(--orange), var(--purple));
        }}
        .header h1 {{ 
            font-family: 'Rajdhani', sans-serif; 
            font-size: 2.5rem; 
            font-weight: 700;
            color: #f0f0f0; 
            margin-bottom: 10px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }}
        .header .subtitle {{ color: #a0a0a0; font-size: 1rem; }}
        .header .brand {{ 
            position: absolute; 
            top: 30px; 
            right: 40px; 
            font-family: 'Rajdhani', sans-serif;
            font-weight: 700;
            color: var(--gold);
            font-size: 1.2rem;
        }}
        
        /* Sections */
        .section {{ 
            background: rgba(255,255,255,0.03); 
            backdrop-filter: blur(10px);
            padding: 30px; 
            border-radius: 16px; 
            margin-bottom: 25px;
            border: 1px solid var(--border);
        }}
        .section h2 {{ 
            font-family: 'Rajdhani', sans-serif;
            color: var(--orange); 
            font-size: 1.5rem; 
            font-weight: 600;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 10px;
        }}
        .section h2::before {{
            content: '';
            display: inline-block;
            width: 4px;
            height: 24px;
            background: linear-gradient(180deg, var(--orange), var(--purple));
            border-radius: 2px;
        }}
        
        /* Info Grid */
        .info-grid {{ 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); 
            gap: 20px; 
            margin-bottom: 20px; 
        }}
        .info-item {{ 
            background: rgba(255,255,255,0.05); 
            padding: 20px; 
            border-radius: 12px; 
            border-left: 3px solid var(--gold);
            transition: transform 0.2s;
        }}
        .info-item:hover {{ transform: translateY(-2px); }}
        .info-item label {{ 
            font-weight: 600; 
            color: #a0a0a0; 
            font-size: 0.75rem; 
            text-transform: uppercase; 
            letter-spacing: 0.5px;
            display: block; 
            margin-bottom: 8px; 
        }}
        .info-item value {{ 
            font-size: 1.1rem; 
            color: #f0f0f0; 
            font-weight: 600; 
        }}
        
        /* Risk Badges */
        .risk-badge {{ 
            display: inline-block; 
            padding: 6px 16px; 
            border-radius: 100px; 
            font-size: 0.85rem; 
            font-weight: 700; 
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }}
        .risk-critical {{ background: linear-gradient(135deg, #dc3545, #c82333); color: white; }}
        .risk-high {{ background: linear-gradient(135deg, #fd7e14, #e65100); color: white; }}
        .risk-medium {{ background: linear-gradient(135deg, #ffc107, #ff9800); color: #333; }}
        .risk-low {{ background: linear-gradient(135deg, #28a745, #218838); color: white; }}
        .risk-very_low {{ background: linear-gradient(135deg, #17a2b8, #138496); color: white; }}
        .risk-unknown {{ background: #6c757d; color: white; }}
        
        /* Map Container */
        .map-container {{ 
            background: rgba(0,0,0,0.3);
            border-radius: 12px; 
            overflow: hidden;
            margin: 20px 0;
            border: 1px solid var(--border);
        }}
        #propertyMap {{ 
            height: 450px; 
            width: 100%; 
        }}
        
        /* Hazard Summary Box */
        .hazard-summary {{
            background: rgba(247,147,30,0.1);
            border: 2px solid var(--orange);
            padding: 20px;
            border-radius: 12px;
            margin-top: 20px;
        }}
        .hazard-summary h3 {{
            font-family: 'Rajdhani', sans-serif;
            color: var(--orange);
            margin-bottom: 15px;
            font-size: 1.2rem;
        }}
        .hazard-list {{
            list-style: none;
            padding-left: 0;
        }}
        .hazard-list li {{
            padding: 10px 0;
            border-bottom: 1px solid rgba(255,255,255,0.1);
            display: flex;
            align-items: flex-start;
            gap: 10px;
        }}
        .hazard-list li:last-child {{ border-bottom: none; }}
        .hazard-icon {{ font-size: 1.2rem; }}
        
        /* Disclaimer */
        .disclaimer {{ 
            background: rgba(255,193,7,0.1); 
            border: 1px solid var(--gold); 
            padding: 20px; 
            border-radius: 12px; 
            font-size: 0.85rem; 
            color: #ffd54f; 
            margin-top: 30px;
        }}
        
        /* Footer */
        .footer {{ 
            margin-top: 40px; 
            padding-top: 25px; 
            border-top: 1px solid var(--border); 
            font-size: 0.85rem; 
            color: #808080; 
            text-align: center; 
        }}
        .footer a {{ color: var(--gold); text-decoration: none; }}
        .footer a:hover {{ text-decoration: underline; }}
        
        /* Responsive */
        @media (max-width: 768px) {{
            .container {{ padding: 20px 15px; }}
            .header {{ padding: 30px 20px; }}
            .header h1 {{ font-size: 1.8rem; }}
            .header .brand {{ position: static; display: block; margin-bottom: 15px; }}
            .info-grid {{ grid-template-columns: 1fr; }}
            #propertyMap {{ height: 300px; }}
        }}
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <div class="brand">
                {f'<img src="{LOGO_DATA_URI}" alt="AI Driven" style="height: 120px; width: auto; vertical-align: middle;">' if LOGO_DATA_URI else '🎩 AI DRIVEN'}
            </div>
            <h1>🏠 Property Due Diligence Report</h1>
            <div class="subtitle">Comprehensive property analysis with hazard assessment | Generated {datetime.now().strftime('%Y-%m-%d %H:%M')}</div>
        </div>
        
        <!-- Property Details -->
        <div class="section">
            <h2>Property Details</h2>
            <div class="info-item" style="margin-bottom: 20px;">
                <label>Address</label>
                <value style="font-size: 1.3rem; color: #f0f0f0;">{full_address}</value>
                <div style="margin-top: 8px; color: #a0a0a0; font-size: 0.9rem;">Coordinates: {coords}</div>
            </div>
            
            <div class="info-grid">
                <div class="info-item">
                    <label>Title Number</label>
                    <value>{title_no}</value>
                </div>
                <div class="info-item">
                    <label>Status</label>
                    <value>{status}</value>
                </div>
                <div class="info-item">
                    <label>Title Type</label>
                    <value>{title_type}</value>
                </div>
                <div class="info-item">
                    <label>Estate Type</label>
                    <value>{estate}</value>
                </div>
            </div>
            
            <div class="info-grid">
                <div class="info-item">
                    <label>Land District</label>
                    <value>{district}</value>
                </div>
                <div class="info-item">
                    <label>Issue Date</label>
                    <value>{issue_date}</value>
                </div>
                <div class="info-item">
                    <label>Number of Owners</label>
                    <value>{owners}</value>
                </div>
                <div class="info-item">
                    <label>Area</label>
                    <value>{area}</value>
                </div>
            </div>
            
            {f'''
            <div class="info-grid" style="margin-top: 20px;">
                <div class="info-item">
                    <label>Floor Area (Estimated)</label>
                    <value>{floor_area:.0f} m²</value>
                </div>
                <div class="info-item">
                    <label>Construction Period</label>
                    <value>{decade_built or "Unknown"}</value>
                </div>
            </div>
            ''' if floor_area else ''}
        </div>
        
        <!-- Easements Section -->
        <div class="section">
            <h2>Easements & Encumbrances</h2>
            
            {f'''
            <div style="margin-bottom: 20px;">
                <label style="color: #a0a0a0; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.5px;">Easement Summary</label>
                <div style="margin-top: 10px; color: #f0f0f0; font-size: 1.1rem;">
                    {easements_data.get('summary', {}).get('summary_text', 'No summary available')}
                </div>
            </div>
            
            {easement_html}
            
            <p style="color: #a0a0a0; font-size: 0.85rem; margin-top: 15px; font-style: italic;">
                ℹ️ Easements affect property rights. Right of way grants access to others. 
                Drainage easements allow council/utility companies to access pipes. 
                Always review full easement documentation with your lawyer before purchase.
            </p>
            ''' if has_easements and easement_count > 0 else '''
            <p style="color: #a0a0a0; font-style: italic;">✓ No easements registered on this title.</p>
            <p style="color: #a0a0a0; font-size: 0.85rem; margin-top: 10px; font-style: italic;">
                ℹ️ Note: Some easements may exist but not be captured in LINZ spatial data. 
                Always verify with a full title search and legal advice.
            </p>
            '''}
        </div>
        
        <!-- Rates Information Section -->
        <div class="section">
            <h2>Property Valuation & Rates</h2>
            
            {rates_html if has_rates else '''
            <p style="color: #a0a0a0; font-style: italic;">Rates information not included in this report.</p>
            <p style="color: #a0a0a0; font-size: 0.85rem; margin-top: 10px;">
                ℹ️ Capital value and rates data available in full Basic Report. Contact us for details.
            </p>
            '''}
        </div>
        
        <!-- Hazard Assessment -->
        <div class="section">
            <h2>Natural Hazard Assessment</h2>
            
            {f'''
            <div style="margin-bottom: 20px;">
                <label style="color: #a0a0a0; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.5px;">Overall Risk Rating</label>
                <div style="margin-top: 10px;">
                    <span class="risk-badge risk-{overall_risk}">{overall_risk.replace('_', ' ').upper()}</span>
                </div>
            </div>
            
            <div class="hazard-summary">
                <h3>⚠️ Hazard Summary</h3>
                <ul class="hazard-list">
                    {''.join([f'<li><span class="hazard-icon">•</span>{line.replace("⚠️ ", "").replace("✓ ", "")}</li>' for line in hazards_data.get('summary', [])])}
                </ul>
            </div>
            
            <div class="info-grid" style="margin-top: 20px;">
                <div class="info-item">
                    <label>Tsunami Risk</label>
                    <value>{hazards_data.get('tsunami', {}).get('description', 'Not assessed')}</value>
                </div>
                <div class="info-item">
                    <label>Flood History</label>
                    <value>{hazards_data.get('flood', {}).get('description', 'Not assessed')}</value>
                </div>
            </div>
            
            {f'''
            <div class="info-item" style="margin-top: 20px;">
                <label>Nearby HAIL Sites (Contaminated Land)</label>
                <div style="margin-top: 10px;">
                    {f'<value>No HAIL sites found within 5km ✓</value>' if not hazards_data.get('hail_sites') else '<value style="color: #ffc107;">⚠️ ' + str(len(hazards_data['hail_sites'])) + ' site(s) found within 5km (see detailed section below)</value>'}
                </div>
            </div>
            ''' if has_hazards else ''}
            ''' if has_hazards else '<p style="color: #a0a0a0; font-style: italic;">Hazard assessment not included in this report.</p>'}
        </div>
        
        <!-- Interactive Map -->
        <div class="section">
            <h2>Location Map</h2>
            <div class="map-container">
                <div id="propertyMap"></div>
            </div>
            <p style="color: #a0a0a0; font-size: 0.9rem; margin-top: 15px;">
                📍 Map shows property location. Zoom and pan to explore the area.
                {f'<br/>⚠️ Hazard zones are approximate - verify with council records.' if has_hazards else ''}
            </p>
        </div>
        
        <!-- Disclaimer -->
        <div class="disclaimer">
            <strong>⚠️ Important Notice:</strong> This report is generated from publicly available data sources including LINZ, 
            Hawke's Bay Regional Council, and Ministry for the Environment. While we strive for accuracy, this information 
            should not replace professional advice from surveyors, builders, or legal professionals. Always verify critical 
            information with relevant authorities before making purchase decisions.
        </div>
        
        <!-- Footer -->
        <div class="footer">
            <p>
                {f'<img src="{LOGO_DATA_URI}" alt="AI Driven" style="height: 60px; width: auto; vertical-align: middle; margin-bottom: 10px;">' if LOGO_DATA_URI else '<strong>AI Driven</strong>'}
            </p>
            <p style="margin-top: 10px;">
                📧 <a href="mailto:gerhard@aidriven.biz">gerhard@aidriven.biz</a> | 
                📱 <a href="tel:+64214028807">021 402 8807</a>
            </p>
            <p style="margin-top: 15px; font-size: 0.8rem; color: #606060;">
                Report generated on {datetime.now().strftime('%Y-%m-%d at %H:%M')} | 
                Data sources: LINZ, HBRC, MfE
            </p>
        </div>
    </div>
    
    <!-- Leaflet JS -->
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    
    <script>
        // Initialize map
        const map = L.map('propertyMap').setView([{lat}, {lon}], 15);
        
        // Add OpenStreetMap tiles
        L.tileLayer('https://{{s}}.tile.openstreetmap.org/{{z}}/{{x}}/{{y}}.png', {{
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19
        }}).addTo(map);
        
        // Add property marker
        const propertyIcon = L.divIcon({{
            className: 'custom-div-icon',
            html: "<div style='background-color: #F7931E; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);'></div>",
            iconSize: [20, 20],
            iconAnchor: [10, 10]
        }});
        
        L.marker([{lat}, {lon}], {{icon: propertyIcon}}).addTo(map)
            .bindPopup('<strong>Property Location</strong><br>{title_no}')
            .openPopup();
        
        {f'''
        // Add hazard markers if available
        const hailSites = {json.dumps(hazards_data.get('hail_sites', []))};
        
        hailSites.forEach(site => {{
            const hailIcon = L.divIcon({{
                className: 'custom-div-icon',
                html: "<div style='background-color: #dc3545; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;'></div>",
                iconSize: [16, 16],
                iconAnchor: [8, 8]
            }});
            
            L.marker([site.lat, site.lon], {{icon: hailIcon}}).addTo(map)
                .bindPopup(`<strong>⚠️ HAIL Site</strong><br>${{site.name}}<br>Distance: ${{site.distance_m}}m`);
        }});
        ''' if has_hazards and hazards_data.get('hail_sites') else ''}
    </script>
</body>
</html>
"""
    
    # Save to file if path provided
    if output_path:
        output_file = Path(output_path)
        output_file.parent.mkdir(parents=True, exist_ok=True)
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(html)
        print(f"✅ Enhanced report saved to: {output_file}")
        return html, str(output_file)
    
    return html, None


def _extract_area(estate_string):
    """Extract area from estate description"""
    if not estate_string:
        return "Unknown"
    
    # Look for area pattern (e.g., "803 square metres")
    import re
    match = re.search(r'(\d+(?:,\d{3})*(?:\.\d+)?)\s*(?:square metres|m²|sq m)', estate_string, re.IGNORECASE)
    if match:
        return f"{match.group(1)} m²"
    
    return estate_string[:100] + "..." if len(estate_string) > 100 else estate_string


def _generate_no_result_report(address, hazards_data=None):
    """Generate report when no title data found"""
    full_address = address.get('full_address', 'Unknown Address')
    
    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>No Result - {full_address}</title>
    <style>
        body {{ font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; background: #f5f5f5; }}
        .container {{ background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }}
        .warning {{ background: #fff3cd; border: 1px solid #ffc107; padding: 20px; border-radius: 5px; color: #856404; }}
        h1 {{ color: #dc3545; }}
    </style>
</head>
<body>
    <div class="container">
        <h1>⚠️ No Property Data Found</h1>
        <div class="warning">
            <strong>Unable to locate property title for:</strong><br>
            {full_address}
        </div>
        <p style="margin-top: 20px;">
            This could be due to:<br>
            • Incorrect or incomplete address<br>
            • Property not yet registered in LINZ database<br>
            • Rural property without formal subdivision<br>
        </p>
        <p style="margin-top: 20px;">
            Please verify the address and try again, or contact us for assistance.
        </p>
    </div>
</body>
</html>
"""
    return html, None


if __name__ == '__main__':
    # Test with sample data
    test_data = {
        'address': {
            'full_address': '31 Douglas McLean Avenue, Marewa, Napier',
            'latitude': -39.500580,
            'longitude': 176.904059
        },
        'title': {
            'title_no': 'HBE2/765',
            'status': 'Live',
            'type': 'Freehold',
            'estate': 'Fee simple in 803 square metres',
            'guarantee_status': 'Guarantee of Title',
            'land_district': 'Hawke\'s Bay',
            'issue_date': '15-Mar-1976',
            'number_owners': 2
        },
        'buildings': {
            'primary_building': {
                'floor_area_m2': 145.5,
                'decade_built': '1970s'
            }
        }
    }
    
    test_hazards = {
        'overall_risk_rating': 'low',
        'summary': ['✓ No critical hazards identified'],
        'tsunami': {'description': 'Property is 2.2km from coast - unlikely to be in tsunami zone'},
        'flood': {'description': 'Property was NOT in Cyclone Gabrielle flood zone (Feb 2023)'},
        'hail_sites': []
    }
    
    html, path = generate_enhanced_report(test_data, test_hazards, 'reports/test-enhanced-report.html')
    print(f"\nTest report generated successfully!")
