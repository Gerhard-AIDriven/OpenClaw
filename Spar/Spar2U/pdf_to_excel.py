import pdfplumber
import pandas as pd
import os

pdf_path = r"C:\Users\gstim\.openclaw\workspace\Spar\Spar2U\Spar2u analysis.pdf"
excel_path = r"C:\Users\gstim\.openclaw\workspace\Spar\Spar2U\Spar2u analysis.xlsx"

all_tables = []

with pdfplumber.open(pdf_path) as pdf:
    for i, page in enumerate(pdf.pages):
        tables = page.extract_tables()
        for table in tables:
            # Convert table to DataFrame
            df = pd.DataFrame(table[1:], columns=table[0])
            all_tables.append(df)
            print(f"Extracted table from page {i+1}")

if all_tables:
    with pd.ExcelWriter(excel_path, engine='openpyxl') as writer:
        for i, df in enumerate(all_tables):
            df.to_excel(writer, sheet_name=f'Table_{i+1}', index=False)
    print(f"Successfully saved to {excel_path}")
else:
    print("No tables found in the PDF.")
