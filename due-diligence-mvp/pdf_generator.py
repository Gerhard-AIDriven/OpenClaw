"""
Due Diligence MVP - PDF Report Generator

Converts HTML reports to PDF format for printing/emailing.
Uses pdfkit (wkhtmltopdf wrapper).

Installation:
1. Install wkhtmltopdf: https://wkhtmltopdf.org/downloads.html
2. Install Python package: pip install pdfkit
"""

import sys
sys.path.insert(0, '.')

from pathlib import Path
from datetime import datetime
from report_generator import generate_html_report

def generate_pdf_from_result(result_data, output_path=None):
    """
    Generate PDF report from query result
    
    Args:
        result_data: Dictionary with address and title info
        output_path: Path to save PDF file (optional)
    
    Returns:
        Path to saved PDF file, or None if failed
    """
    try:
        import pdfkit
    except ImportError:
        print("⚠️  pdfkit not installed.")
        print("   Run: pip install pdfkit")
        print("   Also install wkhtmltopdf: https://wkhtmltopdf.org/downloads.html")
        return None
    
    # Generate HTML with static map (not interactive for PDF)
    html, _ = generate_html_report(result_data, include_interactive_map=False)
    
    # Configure wkhtmltopdf path (Windows default location)
    wkhtmltopdf_path = r'C:\Program Files\wkhtmltopdf\bin\wkhtmltopdf.exe'
    
    if not Path(wkhtmltopdf_path).exists():
        print(f"⚠️  wkhtmltopdf not found at {wkhtmltopdf_path}")
        print("   Please install from: https://wkhtmltopdf.org/downloads.html")
        return None
    
    config = pdfkit.configuration(wkhtmltopdf=wkhtmltopdf_path)
    
    # PDF options
    options = {
        'page-size': 'A4',
        'margin-top': '20mm',
        'margin-right': '15mm',
        'margin-bottom': '20mm',
        'margin-left': '15mm',
        'encoding': 'UTF-8',
        'enable-local-file-access': '',
        'print-media-type': '',
        'javascript-delay': '1000',  # Wait for maps to render
        'no-stop-slow-scripts': ''
    }
    
    # Determine output path
    if output_path is None:
        output_dir = Path(__file__).parent / 'reports'
        output_dir.mkdir(exist_ok=True)
        timestamp = datetime.now().strftime('%Y%m%d-%H%M%S')
        title_no = result_data.get('title', {}).get('title_no', 'unknown').replace('/', '-')
        output_path = output_dir / f'report-{title_no}-{timestamp}.pdf'
    
    try:
        # Convert HTML to PDF
        pdfkit.from_string(html, str(output_path), configuration=config, options=options)
        
        print(f"✅ PDF saved: {output_path}")
        return output_path
        
    except Exception as e:
        print(f"❌ PDF generation failed: {e}")
        return None

if __name__ == '__main__':
    # Test with sample data
    from cached_query import query_title_by_address
    
    print("Testing PDF generation...")
    
    # Query a property
    result = query_title_by_address(
        address_number='31',
        road_name='Douglas McLean Avenue',
        suburb='Marewa',
        use_cache=True
    )
    
    if result:
        # Generate PDF
        pdf_path = generate_pdf_from_result(result)
        
        if pdf_path:
            print(f"\n✅ Test complete! PDF saved to: {pdf_path}")
        else:
            print("\n⚠️  PDF generation requires wkhtmltopdf installation")
    else:
        print("❌ Query failed")
