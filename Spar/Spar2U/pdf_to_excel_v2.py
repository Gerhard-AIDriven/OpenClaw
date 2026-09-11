import pdfplumber
import pandas as pd
import re

pdf_path = r"C:\Users\gstim\.openclaw\workspace\Spar\Spar2U\Spar2u analysis.pdf"
excel_path = r"C:\Users\gstim\.openclaw\workspace\Spar\Spar2U\Spar2u analysis.xlsx"

data = []
# Column headers based on the text read
columns = ["Cust. No.", "Doc. No.", "Doc. Type", "Date", "Origin", "Nett Value", "VAT", "Total Value", "Comment"]

with pdfplumber.open(pdf_path) as pdf:
    for page in pdf.pages:
        text = page.extract_text()
        if not text:
            continue
            
        lines = text.split('\n')
        for line in lines:
            # The data lines start with the customer number 999999
            if line.startswith('999999'):
                parts = line.split()
                # Expecting: 999999 (0) DocNo (1) Type (2) Date (3) Origin (4) Nett (5) VAT (6) Total (7) Comment (8+)
                if len(parts) >= 8:
                    # Handle the possibility of a comment at the end
                    row = parts[:8]
                    comment = " ".join(parts[8:]) if len(parts) > 8 else ""
                    row.append(comment)
                    data.append(row)

if data:
    df = pd.DataFrame(data, columns=columns)
    # Clean numeric columns
    for col in ["Nett Value", "VAT", "Total Value"]:
        df[col] = pd.to_numeric(df[col], errors='coerce')
    
    df.to_excel(excel_path, index=False)
    print(f"Successfully saved {len(data)} rows to {excel_path}")
else:
    print("No transaction data found.")
