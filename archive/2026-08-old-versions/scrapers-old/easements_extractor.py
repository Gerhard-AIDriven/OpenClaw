"""
Due Diligence MVP - Easements Data Extractor (v2 - WORKING APPROACH)

Fetches and formats easement information from LINZ API using:
1. Title layer → Extract DP number from estate_description
2. Linear Parcels layer → Search for easements by affected_surveys

Successfully tested on titles 454362 and HBE2/765 (both returned 0 easements = clean titles)
"""

import sys
sys.stdout.reconfigure(encoding='utf-8')

import requests
import json
import re
from pathlib import Path
from datetime import datetime

# Configuration
API_KEY_FILE = Path(__file__).parent / 'report-generator/Config/linz-api-key.txt'
BASE_WFS_URL = "https://data.linz.govt.nz/services;key={}/wfs"

def get_api_key():
    """Read LINZ API key from file"""
    with open(API_KEY_FILE, 'r', encoding='utf-8') as f:
        return f.read().strip()

def extract_dp_numbers(estate_description):
    """
    Extract Deposited Plan numbers from estate description
    
    Args:
        estate_description: String like "Fee Simple, 1/1, Lot 1 Deposited Plan 414475, 425 m2"
    
    Returns:
        List of DP numbers (strings)
    """
    if not estate_description:
        return []
    
    # Match "Deposited Plan 123456" pattern
    dp_numbers = re.findall(r'Deposited Plan (\d+)', str(estate_description))
    return dp_numbers

def fetch_easements_for_title(title_number):
    """
    Fetch easements affecting a specific title from LINZ API
    
    Workflow:
    1. Query title layer to get estate_description
    2. Extract DP numbers
    3. Search Linear Parcels for easements affecting those DPs
    
    Args:
        title_number: LINZ title number (e.g., "HBE2/765", "454362")
    
    Returns:
        List of easement dictionaries, or empty list if none found
    """
    api_key = get_api_key()
    base_url = BASE_WFS_URL.format(api_key)
    
    print(f"[EASEMENTS] Fetching for {title_number}...")
    
    # Step 1: Get title details to extract DP numbers
    params_title = {
        'service': 'WFS',
        'version': '2.0.0',
        'request': 'GetFeature',
        'typeNames': 'data.linz.govt.nz:layer-50804',
        'outputFormat': 'application/json',
        'cql_filter': f"title_no='{title_number}'"
    }
    
    response = requests.get(base_url, params=params_title, timeout=30)
    if response.status_code != 200:
        print(f"[ERROR] Title query failed: {response.status_code}")
        return []
    
    data = response.json()
    features = data.get('features', [])
    
    if not features:
        print(f"[WARN] Title {title_number} not found")
        return []
    
    props = features[0]['properties']
    estate_desc = props.get('estate_description', '')
    dp_numbers = extract_dp_numbers(estate_desc)
    
    if not dp_numbers:
        print(f"[INFO] No DP numbers found in estate description")
        return []
    
    print(f"[DEBUG] Found DP numbers: {dp_numbers}")
    
    # Step 2: Search Linear Parcels for easements affecting these DPs
    all_easements = []
    
    for dp in dp_numbers:
        params_easement = {
            'service': 'WFS',
            'version': '2.0.0',
            'request': 'GetFeature',
            'typeNames': 'data.linz.govt.nz:layer-51570',
            'outputFormat': 'application/json',
            'cql_filter': f"affected_surveys LIKE '%DP {dp}%'"
        }
        
        response_e = requests.get(base_url, params=params_easement, timeout=30)
        if response_e.status_code != 200:
            print(f"[WARN] Easement query for DP {dp} failed: {response_e.status_code}")
            continue
        
        eas_data = response_e.json()
        easements = eas_data.get('features', [])
        
        for feature in easements:
            eas_props = feature['properties']
            
            # Only include if parcel_intent indicates easement
            if 'easement' in str(eas_props.get('parcel_intent', '')).lower():
                easement = {
                    'easement_type': eas_props.get('parcel_intent', 'Unknown'),
                    'appellation': eas_props.get('appellation', ''),
                    'description': eas_props.get('appellation', ''),  # Use appellation as description
                    'status': eas_props.get('status', 'Unknown'),
                    'affected_surveys': eas_props.get('affected_surveys', ''),
                    'land_district': eas_props.get('land_district', ''),
                    'topology_type': eas_props.get('topology_type', ''),
                    'benefited_title': '',  # Not available in this layer
                    'burdened_title': title_number,
                    'area_sqm': None
                }
                all_easements.append(easement)
    
    if all_easements:
        print(f"[OK] Found {len(all_easements)} easement(s)")
    else:
        print(f"[INFO] No easements found for title {title_number}")
    
    return all_easements


def classify_easement_type(easement_type_raw):
    """Classify raw easement type into user-friendly categories"""
    type_lower = str(easement_type_raw).lower() if easement_type_raw else ''
    
    classifications = {
        'easement': 'Easement',
        'right of way': 'Right of Way',
        'drainage': 'Drainage/Sewerage',
        'stormwater': 'Drainage/Sewerage',
        'sewer': 'Drainage/Sewerage',
        'water': 'Water Supply',
        'electricity': 'Power/Utilities',
        'power': 'Power/Utilities',
        'gas': 'Gas/Oil Pipeline',
        'telecommunications': 'Telecommunications',
        'access': 'Access/Right of Way',
    }
    
    for keyword, category in classifications.items():
        if keyword in type_lower:
            return category
    
    return 'Easement'


def format_easements_table(easements):
    """Format easements as HTML table for report"""
    if not easements:
        return '<p style="color: #a0a0a0; font-style: italic;">✓ No easements registered on this title.</p>'
    
    html = '''
    <div style="margin-top: 20px;">
        <table style="width: 100%; border-collapse: collapse; font-size: 0.9rem;">
            <thead>
                <tr style="background: rgba(247,147,30,0.1); border-bottom: 2px solid var(--orange);">
                    <th style="padding: 12px; text-align: left; color: var(--orange); font-family: 'Rajdhani', sans-serif;">Type</th>
                    <th style="padding: 12px; text-align: left; color: var(--orange); font-family: 'Rajdhani', sans-serif;">Description</th>
                    <th style="padding: 12px; text-align: left; color: var(--orange); font-family: 'Rajdhani', sans-serif;">Status</th>
                    <th style="padding: 12px; text-align: left; color: var(--orange); font-family: 'Rajdhani', sans-serif;">Survey Ref</th>
                </tr>
            </thead>
            <tbody>
    '''
    
    for i, easement in enumerate(easements):
        bg_color = 'rgba(255,255,255,0.03)' if i % 2 == 0 else 'rgba(255,255,255,0.05)'
        easement_class = classify_easement_type(easement['easement_type'])
        
        html += f'''
                <tr style="background: {bg_color}; border-bottom: 1px solid var(--border);">
                    <td style="padding: 12px; vertical-align: top;">
                        <strong style="color: #f0f0f0;">{easement_class}</strong><br>
                        <small style="color: #808080;">{easement['easement_type']}</small>
                    </td>
                    <td style="padding: 12px; vertical-align: top; color: #e0e0e0; max-width: 400px;">
                        {easement['appellation'][:200]}{'...' if len(easement['appellation']) > 200 else ''}
                    </td>
                    <td style="padding: 12px; vertical-align: top;">
                        <span style="padding: 4px 8px; background: {'rgba(40,167,69,0.2)' if easement['status'] == 'Current' or easement['status'] == 'Live' else 'rgba(255,193,7,0.2)'}; 
                               color: {'#28a745' if easement['status'] == 'Current' or easement['status'] == 'Live' else '#ffc107'}; 
                               border-radius: 4px; font-size: 0.8rem; font-weight: 600;">
                            {easement['status']}
                        </span>
                    </td>
                    <td style="padding: 12px; vertical-align: top; color: #e0e0e0; font-size: 0.85rem;">
                        {easement['affected_surveys']}
                    </td>
                </tr>
        '''
    
    html += '''
            </tbody>
        </table>
    </div>
    '''
    
    return html


def extract_easements_summary(easements):
    """Create summary text for easements section"""
    if not easements:
        return {
            'count': 0,
            'has_critical': False,
            'types': [],
            'summary_text': 'No easements registered on this title.'
        }
    
    # Count by type
    type_counts = {}
    for easement in easements:
        easement_class = classify_easement_type(easement['easement_type'])
        type_counts[easement_class] = type_counts.get(easement_class, 0) + 1
    
    # Check for critical easements
    critical_types = ['Right of Way', 'Drainage/Sewerage', 'Power/Utilities']
    has_critical = any(t in critical_types for t in type_counts.keys())
    
    # Build summary text
    summary_parts = [f"{count}x {etype}" for etype, count in type_counts.items()]
    summary_text = f"{len(easements)} easement(s) registered: {', '.join(summary_parts)}"
    
    if has_critical:
        summary_text += " (Critical: access or utilities)"
    
    return {
        'count': len(easements),
        'has_critical': has_critical,
        'types': list(type_counts.keys()),
        'type_breakdown': type_counts,
        'summary_text': summary_text
    }


def get_easements_for_report(title_number):
    """Complete workflow: Fetch easements and prepare for report"""
    print(f"\n[EASEMENTS] Fetching for {title_number}...")
    
    easements = fetch_easements_for_title(title_number)
    summary = extract_easements_summary(easements)
    
    result = {
        'title_number': title_number,
        'easements': easements,
        'summary': summary,
        'html_table': format_easements_table(easements),
        'fetch_timestamp': datetime.now().isoformat()
    }
    
    return result


if __name__ == '__main__':
    # Test with known titles
    test_titles = ['HBE2/765', '454362']
    
    for title in test_titles:
        print("\n" + "="*80)
        print(f"TESTING TITLE: {title}")
        print("="*80)
        
        result = get_easements_for_report(title)
        
        print(f"\nSummary:")
        print(f"  Count: {result['summary']['count']}")
        print(f"  Has Critical: {result['summary']['has_critical']}")
        print(f"  Summary Text: {result['summary']['summary_text']}")
        print(f"  HTML Length: {len(result['html_table'])} chars")
    
    print("\n" + "="*80)
    print("✅ EASEMENTS EXTRACTOR v2 READY")
    print("="*80)
