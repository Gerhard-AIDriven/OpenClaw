import re
from pathlib import Path
from datetime import datetime

p=Path(r"C:\Users\gstim\.openclaw\workspace\Spar\HMR\HMR sub departments .csv")
text=p.read_text(encoding='utf-8',errors='ignore').splitlines()

cols=[
"Sub-Dept","Short Code","Description","Date","Opening Stock at CP","Purchases at CP","IDTs","Stock Adjustments at CP","Waste Adjustments at CP","Recipe Auto Produce at CP","Waste to Sales %","Sales at Cost","S.Take Var to Fin Stock","Fin S.Take Var to Sales %","Theo. Fin Closing Stock","Actual Stock at CP (Products)","Theo to Act Difference CP","Stock Variance (Last Stock Take) at CP","Act S.Take Var to Sales %","Sales Excl. VAT","Front End GP%","Actual Fin GP%","Calc Cost of Sales","Calc GP R","Sales Excl. VAT (%)","Stock Days CP"
]

rows=[]

def num(x):
    x=str(x).strip()
    if x=='':
        return None
    x=x.replace(' ','')
    try:
        return float(x)
    except:
        return None

for line in text:
    line=line.strip()
    if not line:
        continue
    if not re.match(r'^-?\d', line):
        continue
    parts=line.split(',')
    if len(parts)!=26:
        continue
    d=dict(zip(cols,parts))
    for k in cols:
        if k in ("Sub-Dept","Short Code","Description","Date"):
            continue
        d[k]=num(d[k])
    rows.append(d)

print('PARSED_ROWS',len(rows))


def parse_date(s):
    try:
        return datetime.strptime(s,'%d.%m.%Y')
    except:
        return None

valid=[r for r in rows if parse_date(r['Date'])]
maxd=max(parse_date(r['Date']) for r in valid)
latest=[r for r in valid if parse_date(r['Date'])==maxd]
print('MAX_DATE',maxd.strftime('%d.%m.%Y'),'LATEST_ROWS',len(latest))


def top_by(key,top=7,absval=False):
    items=[]
    for r in latest:
        v=r.get(key)
        if v is None:
            continue
        score=abs(v) if absval else v
        items.append((score,v,r))
    items.sort(key=lambda x:x[0],reverse=True)
    return items[:top]

print('\nTOP_STOCK_VARIANCE_ABS')
for score,v,r in top_by('Stock Variance (Last Stock Take) at CP',top=7,absval=True):
    print(r['Short Code'],r['Description'],'variance',r['Stock Variance (Last Stock Take) at CP'],'Theo-Act',r['Theo to Act Difference CP'],'Actual',r['Actual Stock at CP (Products)'])

neg=[r for r in latest if r.get('Opening Stock at CP') is not None and r.get('Opening Stock at CP')<0]
neg_sorted=sorted(neg, key=lambda r:r.get('Opening Stock at CP'))
print('\nNEG_OPENING_STOCK_COUNT',len(neg_sorted))
for r in neg_sorted[:8]:
    print(r['Short Code'],r['Opening Stock at CP'],r['Description'],'Purch',r['Purchases at CP'])

print('\nTOP_WASTE_ADJ_ABS')
for score,v,r in top_by('Waste Adjustments at CP',top=7,absval=True):
    print(r['Short Code'],r['Description'],'wasteAdj',r['Waste Adjustments at CP'],'WasteToSales%',r['Waste to Sales %'],'SalesExVAT',r['Sales Excl. VAT'])

# Compare 2026 vs 2025 using same month/day in file
prev=None
for year in [maxd.year-1,maxd.year-2]:
    tryd=datetime(year,maxd.month,maxd.day)
    if any(parse_date(r['Date'])==tryd for r in valid):
        prev=tryd
        break
print('\nPREV_DATE',prev.strftime('%d.%m.%Y') if prev else None)

if prev:
    bycode={}
    for r in valid:
        bycode.setdefault(r['Short Code'],{})[parse_date(r['Date'])]=r
    metric='Stock Variance (Last Stock Take) at CP'
    changes=[]
    for code,mp in bycode.items():
        if prev in mp and maxd in mp:
            a=mp[prev].get(metric)
            b=mp[maxd].get(metric)
            if a is None or b is None:
                continue
            changes.append((abs(b-a),b-a,code,mp[prev]['Description'],a,b))
    changes.sort(key=lambda x:x[0],reverse=True)
    print('\nTOP_STOCK_VARIANCE_CHANGES')
    for score,delta,code,desc,a,b in changes[:10]:
        print(code,desc,'delta',delta,'from',a,'to',b)

PY