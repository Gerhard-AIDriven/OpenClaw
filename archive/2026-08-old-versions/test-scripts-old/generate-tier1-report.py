"""
Due Diligence MVP - Tier 1 Enhanced Report Generator

End-to-end script that:
1. Queries property title from LINZ (cached)
2. Fetches hazard data (Flood, Tsunami, HAIL)
3. Generates enhanced HTML report with all data
4. Optionally generates PDF

Usage: python generate-tier1-report.py "31 Douglas McLean Avenue, Marewa, Napier"
"""

import sys
import json
from pathlib import Path
from datetime import datetime

sys.stdout.reconfigure(encoding='utf-8')

# Import our modules
from cached_query import query_title_by_address
from fetch_hazards import get_all_hazards
from easements_extractor import get_easements_for_report
from rates_scraper import get_rates_for_report
from report_generator_enhanced import generate_enhanced_report

def generate_tier1_report(address_string, output_dir=None):
    """
    Generate complete Tier 1 Enhanced Due Diligence Report
    
    Args:
        address_string: Full property address (e.g., "31 Douglas McLean Avenue, Marewa, Napier")
        output_dir: Directory to save reports (default: ./reports)
    
    Returns:
        Dict with paths to generated files and summary data
    """
    
    print("=" * 80)
    print("AI DRIVEN - PROPERTY DUE DILIGENCE REPORT GENERATOR")
    print("Tier 1 Enhanced: Title + Hazards")
    print("=" * 80)
    print(f"\nAddress: {address_string}")
    print(f"Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    # Parse address
    parts = [p.strip() for p in address_string.split(',')]
    if len(parts) < 3:
        print(f"❌ Invalid address format. Expected: 'Number Street, Suburb, City'")
        return None
    
    street_part = parts[0]  # e.g., "31 Douglas McLean Avenue"
    suburb = parts[1]       # e.g., "Marewa"
    city = parts[2]         # e.g., "Napier"
    
    # Extract number from street
    street_parts = street_part.split(' ', 1)
    if len(street_parts) < 2 or not street_parts[0].isdigit():
        print(f"❌ Could not extract street number from: {street_part}")
        return None
    
    address_number = street_parts[0]
    road_name = street_parts[1]
    
    print(f"Parsed: #{address_number}, {road_name}, {suburb}, {city}")
    print()
    
    # Step 1: Query property title
    print("[STEP 1/3] Querying property title...")
    print("-" * 80)
    result = query_title_by_address(address_number, road_name, suburb)
    
    if not result.get('title'):
        print("\n❌ No property title found for this address.")
        return None
    
    title_no = result['title'].get('title_no', 'Unknown')
    print(f"\n✅ Title found: {title_no}")
    
    # Step 2: Fetch easements data
    print("\n[STEP 2/5] Fetching easements...")
    print("-" * 80)
    
    easements = get_easements_for_report(title_no)
    print(f"   Found {easements['summary']['count']} easement(s)")
    
    # Step 3: Fetch rates data (MOCK MODE for now)
    print("\n[STEP 3/5] Fetching rates information...")
    print("-" * 80)
    
    rates = get_rates_for_report(address_string, use_mock=True)  # Set use_mock=False when Puppeteer implemented
    if rates['summary']['available']:
        print(f"   ✅ CV: ${rates['summary']['cv']:,} | Annual Rates: ${rates['summary']['annual_rates']:,}")
    else:
        print(f"   ℹ️  Manual entry required")
    
    # Step 4: Fetch hazard data
    print("\n[STEP 4/5] Assessing natural hazards...")
    print("-" * 80)
    
    lat = result['address'].get('latitude')
    lon = result['address'].get('longitude')
    
    if not lat or not lon:
        print("❌ Cannot assess hazards - coordinates not available")
        hazards = None
    else:
        hazards = get_all_hazards(lat, lon, address_string)
        print(f"\n✅ Hazard assessment complete")
        print(f"   Overall Risk: {hazards['overall_risk_rating'].upper()}")
    
    # Step 5: Generate report
    print("\n[STEP 3/3] Generating enhanced report...")
    print("-" * 80)
    
    # Prepare output path
    if output_dir is None:
        output_dir = Path(__file__).parent / 'reports'
    else:
        output_dir = Path(output_dir)
    
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Create filename
    timestamp = datetime.now().strftime('%Y%m%d-%H%M%S')
    safe_title = title_no.replace('/', '-')
    html_filename = f"report-{safe_title}-{timestamp}-TIER1.html"
    html_path = output_dir / html_filename
    
    # Generate HTML (now with easements and rates)
    html_content, saved_path = generate_enhanced_report(result, hazards, easements, rates, str(html_path))
    
    if saved_path:
        print(f"✅ HTML report saved: {saved_path}")
    
    # Summary
    print("\n" + "=" * 80)
    print("REPORT GENERATION COMPLETE")
    print("=" * 80)
    
    summary = {
        'address': address_string,
        'title_no': title_no,
        'generated_at': datetime.now().isoformat(),
        'html_report': saved_path,
        'hazard_summary': hazards.get('summary', []) if hazards else [],
        'overall_risk': hazards.get('overall_risk_rating', 'unknown') if hazards else 'not_assessed',
        'easements_count': easements['summary']['count'],
        'easements_summary': easements['summary'].get('summary_text', ''),
        'has_critical_easements': easements['summary'].get('has_critical', False),
        'rates_available': rates['summary']['available'],
        'capital_value': rates['summary'].get('cv'),
        'annual_rates': rates['summary'].get('annual_rates'),
        'council': rates.get('council')
    }
    
    print(f"\n📄 Property: {address_string}")
    print(f"🏷️  Title: {title_no}")
    print(f"⚠️  Risk Level: {summary['overall_risk'].upper()}")
    print(f"📊 Report: {saved_path}")
    print(f"\nHazard Summary:")
    for line in summary['hazard_summary']:
        print(f"  • {line}")
    
    # Save JSON summary
    json_path = output_dir / f"report-{safe_title}-{timestamp}-summary.json"
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(summary, f, indent=2, default=str)
    print(f"\n📋 Summary JSON: {json_path}")
    
    print("\n" + "=" * 80)
    print("✅ TIER 1 REPORT READY FOR DELIVERY")
    print("=" * 80)
    
    return summary


if __name__ == '__main__':
    # Test address
    test_address = "31 Douglas McLean Avenue, Marewa, Napier"
    
    if len(sys.argv) > 1:
        test_address = sys.argv[1]
    
    result = generate_tier1_report(test_address)
    
    if result:
        print(f"\n🎉 Success! Report generated in {result['html_report']}")
    else:
        print("\n❌ Report generation failed")
        sys.exit(1)
