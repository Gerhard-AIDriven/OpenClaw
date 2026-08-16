const fs = require('fs');
const path = require('path');

const filePath = String.raw`C:\Users\gstim\.openclaw\workspace\Spar\HMR\HMR sub departments .csv`;
const text = fs.readFileSync(filePath, 'utf8');
const lines = text.split(/\r?\n/);

const cols = [
  'Sub-Dept','Short Code','Description','Date',
  'Opening Stock at CP','Purchases at CP','IDTs','Stock Adjustments at CP','Waste Adjustments at CP',
  'Recipe Auto Produce at CP','Waste to Sales %','Sales at Cost','S.Take Var to Fin Stock','Fin S.Take Var to Sales %',
  'Theo. Fin Closing Stock','Actual Stock at CP (Products)','Theo to Act Difference CP','Stock Variance (Last Stock Take) at CP',
  'Act S.Take Var to Sales %','Sales Excl. VAT','Front End GP%','Actual Fin GP%','Calc Cost of Sales','Calc GP R','Sales Excl. VAT (%)','Stock Days CP'
];

function num(x){
  if (x === undefined || x === null) return null;
  x = String(x).trim();
  if (!x) return null;
  x = x.replace(/\s+/g,''); // remove thousand-sep spaces
  const v = Number(x);
  return Number.isFinite(v) ? v : null;
}

function parseDate(d){
  // dd.mm.yyyy
  const m = /^([0-9]{2})\.([0-9]{2})\.([0-9]{4})$/.exec(d);
  if (!m) return null;
  const dd = Number(m[1]), mm=Number(m[2]), yyyy=Number(m[3]);
  return new Date(Date.UTC(yyyy, mm-1, dd));
}

const rows=[];
for (const raw of lines){
  const line = raw.trim();
  if (!line) continue;
  if (!/^-?\d/.test(line)) continue; // skip header lines
  const parts = line.split(',');
  if (parts.length !== 26) continue;
  const r = {};
  for (let i=0;i<26;i++) r[cols[i]] = parts[i];
  for (const k of cols){
    if (['Sub-Dept','Short Code','Description','Date'].includes(k)) continue;
    r[k] = num(r[k]);
  }
  rows.push(r);
}

console.log('PARSED_ROWS', rows.length);

const valid = rows.map(r => ({r, d: parseDate(r.Date)})).filter(x => x.d);
const maxD = valid.reduce((a,b)=> b.d>a.d?b:a).d;
const latest = valid.filter(x => x.d.getTime()===maxD.getTime()).map(x=>x.r);

function dateFmt(dt){
  const dd = String(dt.getUTCDate()).padStart(2,'0');
  const mm = String(dt.getUTCMonth()+1).padStart(2,'0');
  const yyyy = dt.getUTCFullYear();
  return `${dd}.${mm}.${yyyy}`;
}

console.log('MAX_DATE', dateFmt(maxD), 'LATEST_ROWS', latest.length);

function topBy(key,{top=7,abs=false}={}){
  const items=[];
  for (const r of latest){
    const v = r[key];
    if (v===null || v===undefined) continue;
    const score = abs ? Math.abs(v) : v;
    items.push({score,v,r});
  }
  items.sort((a,b)=>b.score-a.score);
  return items.slice(0,top);
}

console.log('\nTOP_STOCK_VARIANCE_ABS');
for (const it of topBy('Stock Variance (Last Stock Take) at CP',{top:7,abs:true})){
  console.log(it.r['Short Code'], it.r.Description,'variance',it.r[keySafe('Stock Variance (Last Stock Take) at CP')], 'Theo-Act', it.r['Theo to Act Difference CP'], 'Actual', it.r['Actual Stock at CP (Products)']);
}

function keySafe(k){return k;}

const neg = latest.filter(r => r['Opening Stock at CP']!==null && r['Opening Stock at CP']<0);
neg.sort((a,b)=>a['Opening Stock at CP']-b['Opening Stock at CP']);
console.log('\nNEG_OPENING_STOCK_COUNT', neg.length);
for (const r of neg.slice(0,8)){
  console.log(r['Short Code'], r['Opening Stock at CP'], r.Description,'Purch',r['Purchases at CP']);
}

console.log('\nTOP_WASTE_ADJ_ABS');
for (const it of topBy('Waste Adjustments at CP',{top:7,abs:true})){
  console.log(it.r['Short Code'], it.r.Description,'wasteAdj',it.r['Waste Adjustments at CP'],'WasteToSales%',it.r['Waste to Sales %'],'SalesExVAT',it.r['Sales Excl. VAT']);
}

// Compare 2026 vs 2025 by same month/day
const prevDate = new Date(Date.UTC(maxD.getUTCFullYear()-1, maxD.getUTCMonth(), maxD.getUTCDate()));
const prev = valid.filter(x => x.d.getTime()===prevDate.getTime());

console.log('\nPREV_DATE', prev.length ? dateFmt(prevDate) : null);
if (prev.length){
  const byCode = new Map();
  for (const {r,d} of valid){
    const key = r['Short Code'];
    if (!byCode.has(key)) byCode.set(key, new Map());
    byCode.get(key).set(d.getTime(), r);
  }
  const metric='Stock Variance (Last Stock Take) at CP';
  const changes=[];
  for (const [code,mp] of byCode.entries()){
    if (mp.has(prevDate.getTime()) && mp.has(maxD.getTime())){
      const a=mp.get(prevDate.getTime())[metric];
      const b=mp.get(maxD.getTime())[metric];
      if (a===null||b===null) continue;
      changes.push({score: Math.abs(b-a), delta: b-a, code, desc: mp.get(prevDate.getTime()).Description, from:a, to:b});
    }
  }
  changes.sort((x,y)=>y.score-x.score);
  console.log('\nTOP_STOCK_VARIANCE_CHANGES');
  for (const c of changes.slice(0,10)){
    console.log(c.code,c.desc,'delta',c.delta,'from',c.from,'to',c.to);
  }
}
