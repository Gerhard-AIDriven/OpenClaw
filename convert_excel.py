import pandas as pd
import sys

excel_file = r'C:\Users\gstim\.openclaw\workspace\Spar\Data Extracts\gws butchery.xls'
output_csv = r'C:\Users\gstim\.openclaw\workspace\Spar\Data Extracts\gws_butchery.csv'

try:
    # Try with xlrd for older .xls files
    df = pd.read_excel(excel_file, sheet_name=0, engine='xlrd')
    df.to_csv(output_csv, index=False)
    print(f"✓ Converted to CSV: {output_csv}")
    print(f"✓ Rows: {len(df)}, Columns: {len(df.columns)}")
    print(f"✓ Columns: {', '.join(df.columns.tolist())}")
except Exception as e:
    print(f"✗ Error: {e}")
    sys.exit(1)
