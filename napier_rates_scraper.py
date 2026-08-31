#!/usr/bin/env python3
"""
Napier City Council Rates Scraper — Prototype V2
===============================================
Resolves an address via the JSON API, then scrapes the My Property page
using Playwright to extract structured rates and valuation data.
INCLUDES: Easements extraction from MyProperty page

Usage:
    python napier_rates_scraper.py [ADDRESS]
    python napier_rates_scraper.py "31 Douglas McLean avenue"

If no address is given, defaults to "31 Douglas McLean avenue".
"""
import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

import json
import re
import time
import requests
from playwright.sync_api import sync_playwright

DEFAULT_ADDRESS = "31 Douglas McLean avenue"

# Rows in the council rates table that are summaries, not charge line items
COUNCIL_SUMMARY_LABELS = {
    "Total Rates Levied", "Rates Last Year", "Instalments YTD", "Current Instalment"
}


# ── Step 1: Resolve address → RID ──────────────────────────────────────────

def resolve_address(address: str) -> dict:
    """Look up an address on the NCC JSON API and return RID + display name.
    
    Pre-processes address to improve match rate:
    - Removes ', Napier' suffix (API doesn't want city name)
    - Keeps full street type names (Avenue, not Ave)
    """
    # Clean up address for API lookup
    cleaned = address.strip()
    # Remove city suffix if present (API doesn't need it)
    if cleaned.lower().endswith(", napier"):
        cleaned = cleaned[:-7].strip()
    
    url = "https://data.napier.govt.nz/regional/ncc/property_find.php"
    resp = requests.get(url, params={"search": cleaned, "type": "address"}, timeout=15)
    resp.raise_for_status()
    try:
        results = resp.json()
    except requests.exceptions.JSONDecodeError:
        # Handle cases where the API returns non-JSON (e.g., an HTML error page or empty body)
        print(f"⚠️  API returned non-JSON response for {address}: {resp.text[:200]}", file=sys.stderr)
        raise ValueError(f"API error: Received invalid JSON response for address: {address}")
    if not results or results[0].get("id") == "0":
        raise ValueError(f"No results found for address: {address}")
    best = results[0]
    return {"rid": best["id"], "display": best["value"]}


# ── Step 2-3: Load page & wait for render ──────────────────────────────────

def load_property_page(rid: str, headless: bool = True):
    """Open the My Property page and wait for JS-rendered content to appear."""
    p = sync_playwright().start()
    browser = p.chromium.launch(headless=headless)
    page = browser.new_page()
    url = f"https://www.napier.govt.nz/services/properties-and-rates/my-property/?rid={rid}"
    page.goto(url, timeout=60000, wait_until="domcontentloaded")
    # Wait for rates content to render (JS-populated)
    try:
        page.wait_for_function(
            """() => document.body.innerText.includes('Rates for')""",
            timeout=20000,
        )
    except Exception:
        pass  # Content may already be present
    time.sleep(5)
    return p, browser, page


# ── Step 4: Scrape & parse rates data ───────────────────────────────────────

def _parse_currency(s: str) -> float | None:
    """Parse '$4,333.02' → 4333.02"""
    if not s:
        return None
    m = re.search(r"\$?([\d,]+\.\d{2})", s)
    if m:
        return float(m.group(1).replace(",", ""))
    m = re.search(r"\$?([\d,]+)", s)
    if m:
        return float(m.group(1).replace(",", ""))
    return None


def _parse_area(s: str) -> float | None:
    """Parse '0.0803' → 0.0803"""
    m = re.search(r"([\d.]+)", s)
    return float(m.group(1)) if m else None


def _safe_cell(row, idx):
    """Safely get a cell from a row, returning None if index out of range."""
    return row[idx] if len(row) > idx else None


def scrape_rates(page, rid: str, display: str) -> dict:
    """Extract structured rates and property data from the rendered page."""

    out = {
        "address": display,
        "rid": rid,
        "property": {},
        "council_rates": {},
        "regional_council_rates": {},
        "rates_history": [],
        "regional_rates_history": [],
        "instalments": [],
    }

    # ── Parse all tables into text ──
    tables = page.query_selector_all("table")
    table_texts = []
    for table in tables:
        rows = table.query_selector_all("tr")
        tbl = []
        for row in rows:
            cells = row.query_selector_all("td, th")
            tbl.append([c.inner_text().strip() for c in cells])
        table_texts.append(tbl)

    # ── Property Details ──
    property_fields = {
        "Property Address": "address",
        "Valuation Number": "valuation_number",
        "Record of Title": "record_of_title",
        "Area (Ha)": "area_ha",
        "Legal Description": "legal_description",
        "Property ID": "property_id",
        "Supplementary Legal Description": "supplementary_legal_description",
    }

    # From dt/dd pairs
    dts = page.query_selector_all("dt")
    dds = page.query_selector_all("dd")
    for dt, dd in zip(dts, dds):
        label = dt.inner_text().strip()
        value = dd.inner_text().strip()
        if label in property_fields:
            key = property_fields[label]
            out["property"][key] = _parse_area(value) if key == "area_ha" else value

    # From table "Details" sections
    for tbl in table_texts:
        if tbl and len(tbl) > 1 and tbl[0] == ["Details"]:
            for row in tbl[1:]:
                if len(row) >= 2 and row[0] in property_fields:
                    key = property_fields[row[0]]
                    out["property"][key] = _parse_area(row[1]) if key == "area_ha" else row[1]

    # ── Valuation Details Tables ──
    # There are two "Valuation Details" tables:
    #   1st = Council (has Current & New columns)
    #   2nd = Regional (single Current column)
    val_table_idx = 0
    for tbl in table_texts:
        if tbl and tbl[0] == ["Valuation Details"]:
            # Find the "Valuations" row to determine column layout
            val_row_idx = None
            has_new_column = False
            for i, row in enumerate(tbl):
                if row and row[0] == "Valuations":
                    val_row_idx = i
                    has_new_column = len(row) >= 3 and "New" in row
                    break

            if val_table_idx == 0:
                # Council Valuation Table
                # Also extract property details from this table
                for row in tbl[1:]:
                    if row[0] == "Valuation Number":
                        out["property"]["valuation_number"] = row[1] if len(row) > 1 else out["property"].get("valuation_number")
                    elif row[0] == "Valuation Address":
                        if "address" not in out["property"] or not out["property"]["address"]:
                            out["property"]["address"] = row[1] if len(row) > 1 else None

                if val_row_idx is not None:
                    # Parse valuation data rows after the Valuations header
                    for row in tbl[val_row_idx + 1:]:
                        if not row or not row[0]:
                            continue
                        if row[0] == "Land Value":
                            out["council_rates"]["land_value_current"] = _parse_currency(row[1])
                            if has_new_column:
                                out["council_rates"]["land_value_new"] = _parse_currency(_safe_cell(row, 2))
                        elif row[0] == "Capital Value":
                            out["council_rates"]["capital_value_current"] = _parse_currency(row[1])
                            if has_new_column:
                                out["council_rates"]["capital_value_new"] = _parse_currency(_safe_cell(row, 2))
                        elif row[0] == "Improvements":
                            out["council_rates"]["improvements_current"] = _parse_currency(row[1])
                            if has_new_column:
                                out["council_rates"]["improvements_new"] = _parse_currency(_safe_cell(row, 2))
                        elif row[0] == "Valuation Date":
                            out["council_rates"]["valuation_date_current"] = row[1]
                            if has_new_column:
                                out["council_rates"]["valuation_date_new"] = _safe_cell(row, 2)
                        # Stop when we hit a non-valuation row (next section)
                        elif row[0] not in ("Land Value", "Capital Value", "Improvements", "Valuation Date"):
                            break

            elif val_table_idx == 1:
                # Regional Valuation Table
                for row in tbl[1:]:
                    if not row or not row[0]:
                        continue
                    if row[0] == "Land Value":
                        out["regional_council_rates"]["land_value"] = _parse_currency(row[1])
                    elif row[0] == "Capital Value":
                        out["regional_council_rates"]["capital_value"] = _parse_currency(row[1])
                    elif row[0] == "Improvements":
                        out["regional_council_rates"]["improvements"] = _parse_currency(row[1])

            val_table_idx += 1

    # ── Council Rates Breakdown Table ──
    # 6-column: Type, Description (Basis), Factor, Amount ($), Remission ($), Total
    for tbl in table_texts:
        if tbl and len(tbl) > 1 and tbl[0] == [
            "Type", "Description (Basis)", "Factor", "Amount ($)", "Remission ($)", "Total"
        ]:
            charges = []
            for row in tbl[1:]:
                joined = " ".join(row)
                if "Total Rates Levied" in joined:
                    out["council_rates"]["total_rates_levied"] = _parse_currency(row[-1])
                elif "Rates Last Year" in joined:
                    out["council_rates"]["rates_last_year"] = _parse_currency(row[-1])
                elif row[0] and row[0] not in ("",) and row[0] not in COUNCIL_SUMMARY_LABELS:
                    charges.append({
                        "type": _safe_cell(row, 0),
                        "description": _safe_cell(row, 1),
                        "factor": _safe_cell(row, 2),
                        "amount": _parse_currency(_safe_cell(row, 3)),
                        "remission": _parse_currency(_safe_cell(row, 4)),
                        "total": _parse_currency(_safe_cell(row, 5)),
                    })
            out["council_rates"]["charges"] = charges

    # ── Regional Rates Breakdown Table ──
    # 5-column: Type, Description (Basis), Factor, Rates Cents / Unit, Amount
    for tbl in table_texts:
        if tbl and len(tbl) > 1 and tbl[0] == [
            "Type", "Description (Basis)", "Factor", "Rates Cents / Unit", "Amount"
        ]:
            charges = []
            for row in tbl[1:]:
                joined = " ".join(row)
                if "Total Rates Levied" in joined:
                    out["regional_council_rates"]["total_rates_levied"] = _parse_currency(row[-1])
                elif "Rates Last Year" in joined:
                    out["regional_council_rates"]["rates_last_year"] = _parse_currency(row[-1])
                elif row[0] and row[0] not in ("",) and "Total" not in joined and "Instalments" not in joined:
                    charges.append({
                        "type": _safe_cell(row, 0),
                        "description": _safe_cell(row, 1),
                        "factor": _safe_cell(row, 2),
                        "rates_cents_per_unit": _safe_cell(row, 3),
                        "amount": _parse_currency(_safe_cell(row, 4)),
                    })
            out["regional_council_rates"]["charges"] = charges

    # ── Instalment Schedule ──
    for tbl in table_texts:
        if tbl and len(tbl) > 1 and tbl[0] == [
            "Instalment number", "Last day for payment", "Amount ($)", "Period covered"
        ]:
            instalments = []
            for row in tbl[1:]:
                if row[0] and row[0].strip().isdigit():
                    instalments.append({
                        "instalment": int(row[0]),
                        "due_date": row[1],
                        "amount": _parse_currency(row[2]),
                        "period": row[3],
                    })
            out["instalments"] = instalments

    # ── Rates History ──
    # First occurrence = council, second = regional
    history_count = 0
    for tbl in table_texts:
        if tbl and len(tbl) > 1 and tbl[0] == ["Year", "Land Value", "Capital Value", "Annual Rates"]:
            history = []
            for row in tbl[1:]:
                if row[0] and "/" in row[0]:
                    history.append({
                        "year": row[0],
                        "land_value": _parse_currency(row[1]),
                        "capital_value": _parse_currency(row[2]),
                        "annual_rates": _parse_currency(row[3]),
                    })
            if history_count == 0:
                out["rates_history"] = history
            elif history_count == 1:
                out["regional_rates_history"] = history
            history_count += 1

    # ── Rubbish & Recycling ──
    out["rubbish_and_recycling"] = {}
    for tbl in table_texts:
        for i, row in enumerate(tbl):
            if row and row[0] == "Rubbish collection" and len(row) > 1:
                out["rubbish_and_recycling"]["rubbish"] = row[1]
            elif row and row[0] == "Recycling collection" and len(row) > 1:
                out["rubbish_and_recycling"]["recycling"] = row[1]
    if not out["rubbish_and_recycling"]:
        del out["rubbish_and_recycling"]

    # ── Building Consents ──
    consents = []
    for tbl in table_texts:
        if tbl and len(tbl) > 1 and tbl[0] == ["Consent", "Proposal", "Status"]:
            for row in tbl[1:]:
                if row[0] and row[0].strip().isdigit():
                    consents.append({
                        "consent_number": row[0],
                        "proposal": row[1],
                        "status": row[2],
                    })
    out["building_consents"] = consents if consents else None

    # ── Easements (if available on the page) ──
    # Look for easements section in tables
    easements = []
    for tbl in table_texts:
        for i, row in enumerate(tbl):
            joined_row = ' '.join(row).lower()
            if 'easement' in joined_row or 'right of way' in joined_row:
                if len(row) >= 2:
                    easements.append({
                        "type": row[0] if 'easement' not in row[0].lower() else 'Easement',
                        "description": row[1] if len(row) > 1 else row[0],
                    })
    
    # Also check dt/dd pairs for easements
    for dt, dd in zip(dts, dds):
        label = dt.inner_text().strip().lower()
        value = dd.inner_text().strip()
        if 'easement' in label or 'right of way' in label:
            easements.append({
                "type": dt.inner_text().strip(),
                "description": value,
            })
    
    out["easements"] = easements if easements else []

    # ── Clean up empty dicts and None values ──
    for key in list(out.keys()):
        if isinstance(out[key], dict) and not out[key]:
            del out[key]
        elif out.get(key) is None:
            del out[key]

    return out


def main():
    address = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_ADDRESS
    print(f"🔍 Resolving address: {address}", file=sys.stderr)

    rid_info = resolve_address(address)
    rid = rid_info["rid"]
    print(f"✅ Found RID: {rid} → {rid_info['display']}", file=sys.stderr)

    print(f"🌐 Loading property page...", file=sys.stderr)
    p, browser, page = load_property_page(rid)

    print(f"📊 Scraping rates data...", file=sys.stderr)
    data = scrape_rates(page, rid, rid_info["display"])

    print(json.dumps(data, indent=2, ensure_ascii=False))

    browser.close()
    p.stop()
    print(f"\n✅ Done!", file=sys.stderr)


if __name__ == "__main__":
    main()
