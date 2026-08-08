#!/usr/bin/env python3
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

# Load HTML
with open('due-diligence-mvp/napier_rid_138159-107977_source.html', 'r', encoding='utf-8') as f:
    html = f.read()

print("Testing regex patterns...")
print("="*80)

# Test 1: Legal Description
print("\n1. Legal Description:")
patterns = [
    r'<td>Legal Description&nbsp;</td>\s*<td[^>]*>(LOT\s+\d+\s+DP\s+\d+)',
    r'<td>Legal\s*Description[^>]*>\s*</td>\s*<td[^>]*>(LOT[^<]+)',
]

for i, pattern in enumerate(patterns, 1):
    match = re.search(pattern, html, re.IGNORECASE)
    if match:
        print(f"   Pattern {i}: MATCH - {match.group(1).strip()}")
    else:
        print(f"   Pattern {i}: NO MATCH")

# Test 2: Annual Rates / Total Rates Levied
print("\n2. Annual Rates / Total Rates:")
patterns = [
    r'<td[^>]*colspan[^>]*>Total Rates Levied</td>\s*<td[^>]*>([\d,]+\.\d+)',
    r'Total Rates Levied</strong></td>\s*<td[^>]*><strong>\s*\$?([\d,]+\.\d+)',
    r'<td[^>]*>Total Rates Levied[^>]*>.*?</td>\s*<td[^>]*>([\d,]+\.\d+)',
]

for i, pattern in enumerate(patterns, 1):
    match = re.search(pattern, html, re.IGNORECASE | re.DOTALL)
    if match:
        print(f"   Pattern {i}: MATCH - ${match.group(1)}")
    else:
        print(f"   Pattern {i}: NO MATCH")

# Test 3: Show actual HTML snippets for debugging
print("\n3. Actual HTML snippets:")
snippets = [
    (r'Legal Description.{0,100}', "Legal Description context"),
    (r'Total Rates Levied.{0,100}', "Total Rates Levied context"),
]

for pattern, desc in snippets:
    matches = re.findall(pattern, html, re.IGNORECASE | re.DOTALL)
    if matches:
        print(f"   {desc}:")
        for m in matches[:2]:
            print(f"      {m[:150]}")
