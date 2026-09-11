import pdfplumber
import pandas as pd

pdf_path = r"C:\Users\gstim\.openclaw\workspace\Spar\Spar2U\Spar2u analysis.pdf"
text_output = r"C:\Users\gstim\.openclaw\workspace\Spar\Spar2U\Spar2u analysis_text.txt"

with pdfplumber.open(pdf_path) as pdf:
    full_text = ""
    for page in pdf.pages:
        full_text += page.extract_text() + "\n\n"

with open(text_output, "w", encoding="utf-8") as f:
    f.write(full_text)

print(f"Text extracted to {text_output}")
