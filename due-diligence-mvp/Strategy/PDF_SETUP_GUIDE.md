# PDF Report Generation Setup Guide

To generate PDF versions of due diligence reports, you need two components:

## 1. Install wkhtmltopdf (System Tool)

**Download:** https://wkhtmltopdf.org/downloads.html

**Windows:**
1. Download `wkhtmltox-0.12.6-1.msvc2015-win64.exe` (or latest)
2. Run installer
3. Default location: `C:\Program Files\wkhtmltopdf\bin\wkhtmltopdf.exe`
4. Add to PATH (optional): `C:\Program Files\wkhtmltopdf\bin`

**Verify Installation:**
```cmd
wkhtmltopdf --version
```

Should output: `wkhtmltopdf 0.12.6 (with patched qt)`

## 2. Install Python pdfkit Package

```bash
pip install pdfkit
```

## 3. Test PDF Generation

```bash
cd C:\Users\gstim\.openclaw\workspace\due-diligence-mvp
python pdf_generator.py
```

If successful, you'll see:
```
✅ PDF saved: reports\report-HBE2-765-YYYYMMDD-HHMMSS.pdf
```

## 4. Generate Both HTML + PDF

```bash
python generate-report.py
```

This will create:
- `report-HBE2-765-timestamp.html` (interactive map)
- `report-HBE2-765-timestamp.pdf` (static map, printable)

---

## Troubleshooting

### "pdfkit not installed"
```bash
pip install pdfkit
```

### "wkhtmltopdf not found"
1. Verify installation: `C:\Program Files\wkhtmltopdf\bin\wkhtmltopdf.exe` exists
2. If installed elsewhere, edit `pdf_generator.py` and update the path:
   ```python
   wkhtmltopdf_path = r'YOUR\PATH\wkhtmltopdf.exe'
   ```

### PDF looks broken/blank
- Ensure wkhtmltopdf is version 0.12.6 or later
- Check that HTML renders correctly in browser first
- The static map in PDF won't be interactive (by design)

### PDF missing styles
- Add `'enable-local-file-access': ''` to options (already included)
- Use absolute paths for CSS if hosting externally

---

## Why wkhtmltopdf?

**Alternatives considered:**
- **ReportLab:** Pure Python but requires manual layout (no HTML/CSS)
- **WeasyPrint:** Good but complex dependencies on Windows
- **Pyppeteer:** Headless Chrome (overkill, slow)

**wkhtmltopdf advantages:**
- Renders HTML/CSS exactly as browser
- Fast conversion
- Mature, stable project
- Single executable (no browser needed)
- Excellent print media type support

---

## Usage in Production

### Option 1: Generate Both Formats Always
```python
from generate_report import main  # Creates HTML + PDF
```

### Option 2: HTML Only (Fast)
```python
from report_generator import generate_html_report
html, path = generate_html_report(result, include_interactive_map=True)
```

### Option 3: PDF Only (On Demand)
```python
from pdf_generator import generate_pdf_from_result
pdf_path = generate_pdf_from_result(result)
```

---

## File Sizes

Typical output:
- **HTML:** ~50-80 KB (includes Leaflet.js from CDN)
- **PDF:** ~200-400 KB (A4, single page)

Both are email-friendly and web-ready.

---

## Next Steps

Once PDF generation is working, we can:
- Add watermarks to PDF
- Include QR code linking to interactive HTML version
- Batch generate reports for multiple properties
- Email reports automatically via Gmail API

---

**Last Updated:** 2026-08-07  
**Tested On:** Windows 10/11, Python 3.12
