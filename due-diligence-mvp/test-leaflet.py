"""
Quick test of Leaflet interactive map
"""

import sys
sys.path.insert(0, '.')

from cached_query import query_title_by_address
from report_generator import generate_html_report

# Query property
result = query_title_by_address(
    address_number='31',
    road_name='Douglas McLean Avenue',
    suburb='Marewa',
    use_cache=True
)

if result:
    # Generate HTML with interactive map
    html, path = generate_html_report(result, include_interactive_map=True)
    print(f"\n✅ Interactive HTML report generated: {path}")
    print("Open in browser to see the Leaflet map!")
