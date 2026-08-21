"""
Due Diligence MVP - Complete Report Generation

Usage:
    python generate-report.py "31 Douglas McLean Avenue" Marewa
    
Or edit the address below and run directly.
"""

import sys
sys.path.insert(0, '.')

from cached_query import query_title_by_address
from report_generator import generate_html_report
from pdf_generator import generate_pdf_from_result
from pathlib import Path

def main():
    print("=" * 60)
    print("DUE DILIGENCE MVP - REPORT GENERATOR")
    print("=" * 60)
    
    # Default test address
    address_number = '31'
    road_name = 'Douglas McLean Avenue'
    suburb = 'Marewa'
    
    # Allow command line override
    if len(sys.argv) >= 3:
        address_number = sys.argv[1]
        road_name = sys.argv[2]
        if len(sys.argv) >= 4:
            suburb = sys.argv[3]
    
    print(f"\nAddress: {address_number} {road_name}, {suburb}\n")
    
    # Query property title
    result = query_title_by_address(
        address_number=address_number,
        road_name=road_name,
        suburb=suburb,
        use_cache=True
    )
    
    if not result:
        print("\n❌ Query failed - no results")
        return
    
    # Generate HTML report
    print("\n" + "=" * 60)
    print("GENERATING REPORTS")
    print("=" * 60)
    
    html, html_path = generate_html_report(result, include_interactive_map=True)
    print(f"✅ HTML report saved: {html_path}")
    
    # Generate PDF report (optional, requires wkhtmltopdf)
    print("\nGenerating PDF version...")
    pdf_path = generate_pdf_from_result(result)
    if pdf_path:
        print(f"✅ PDF report saved: {pdf_path}")
    else:
        print("⚠️  PDF generation skipped (install wkhtmltopdf for PDF support)")
    
    print(f"\n✅ COMPLETE!")
    print(f"\n📄 Reports generated:")
    print(f"   HTML (interactive): {html_path}")
    if pdf_path:
        print(f"   PDF (printable):    {pdf_path}")
    
    print(f"\n💡 Tip: Open HTML in browser for interactive map, use PDF for printing/emailing.")
    
    if result.get('title'):
        print(f"\n📊 Summary:")
        print(f"   Title: {result['title']['title_no']}")
        print(f"   Type: {result['title']['type']}")
        print(f"   Owners: {result['title']['number_owners']}")
        print(f"   Status: {result['title']['status']}")

if __name__ == '__main__':
    main()
