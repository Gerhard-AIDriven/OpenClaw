const fs=require('fs');
const filePath=String.raw`C:\Users\gstim\.openclaw\workspace\Spar\HMR\HMR sub departments .csv`;
const text=fs.readFileSync(filePath,'utf8');
const lines=text.split(/\r?\n/).map(l=>l.trim()).filter(Boolean);
const cols=[
  'Sub-Dept','Short Code','Description','Date',
  'Opening Stock at CP','Purchases at CP','IDTs','Stock Adjustments at CP','Waste Adjustments at CP','Recipe Auto Produce at CP','Waste to Sales %','Sales at Cost','S.Take Var to Fin Stock','Fin S.Take Var to Sales %','Theo. Fin Closing Stock','Actual Stock at CP (Products)','Theo to Act Difference CP','Stock Variance (Last Stock Take) at CP','Act S.Take Var to Sales %','Sales Excl. VAT','Front End GP%','Actual Fin GP%','Calc Cost of Sales','Calc GP R','Sales Excl. VAT (%)','Stock Days CP'
];
function num(x){ if(x==null) return null; x=String(x).trim(); if(!x) return null; x=x.replace(/\s+/g,''); const v=Number(x); return Number.isFinite(v)?v:null; }
function parseDate(d){ const m=/^([0-9]{2})\.([0-9]{2})\.([0-9]{4})$/.exec(d); if(!m) return null; const dd=+m[1], mm=+m[2], yyyy=+m[3]; return new Date(Date.UTC(yyyy,mm-1,dd)); }

const rows=[];
for(const line of lines){
  if(!/^-?\d/.test(line)) continue;
  const parts=line.split(',');
  if(parts.length!==26) continue;
  const r={};
  for(let i=0;i<26;i++) r[cols[i]]=parts[i];
  r.d=parseDate(r.Date);
  if(!r.d) continue;
  for(const k of cols){
    if(['Sub-Dept','Short Code','Description','Date'].includes(k)) continue;
    r[k]=num(r[k]);
  }
  rows.push(r);
}

const maxD=rows.reduce((a,r)=> r.d>a? r.d:a, new Date(0));
const latestDate=maxD;
const prevDate=new Date(Date.UTC(latestDate.getUTCFullYear()-1, latestDate.getUTCMonth(), latestDate.getUTCDate()));
const latest=rows.filter(r=>r.d.getTime()===latestDate.getTime());
const prev=rows.filter(r=>r.d.getTime()===prevDate.getTime());

console.log('Latest date:',latestDate.toISOString().slice(0,10),'Prev date:',prevDate.toISOString().slice(0,10));

const mapPrev=new Map(prev.map(r=>[r['Short Code'], r]));
const pairs=[];
for(const r of latest){
  const p=mapPrev.get(r['Short Code']);
  if(!p) continue;
  pairs.push({code:r['Short Code'], desc:r.Description, r2026:r, r2025:p});
}
console.log('Pairs found:',pairs.length);

const metrics=[
  'Stock Variance (Last Stock Take) at CP',
  'Theo to Act Difference CP',
  'Opening Stock at CP',
  'Actual Stock at CP (Products)',
  'Waste Adjustments at CP',
  'Waste to Sales %'
];

function dateToDMY(d){
  const dd=String(d.getUTCDate()).padStart(2,'0');
  const mm=String(d.getUTCMonth()+1).padStart(2,'0');
  const yyyy=d.getUTCFullYear();
  return `${dd}.${mm}.${yyyy}`;
}

function topDelta(metric,dir='pos',top=5){
  const items=[];
  for(const pp of pairs){
    const a=pp.r2025[metric];
    const b=pp.r2026[metric];
    if(a==null||b==null) continue;
    const delta=b-a;
    items.push({delta,a,b,code:pp.code,desc:pp.desc});
  }
  items.sort((x,y)=>dir==='pos' ? y.delta-x.delta : x.delta-y.delta);
  return items.slice(0,top);
}

for(const m of metrics){
  console.log('\n===',m,'===');
  console.log('Top increases (2026 - 2025):');
  for(const it of topDelta(m,'pos',5)){
    console.log(` ${it.code} ${it.desc}: ${it.a} -> ${it.b} (Δ ${it.delta})`);
  }
  console.log('Top decreases (2026 - 2025):');
  for(const it of topDelta(m,'neg',5)){
    console.log(` ${it.code} ${it.desc}: ${it.a} -> ${it.b} (Δ ${it.delta})`);
  }
}

console.log('\nDate labels:',dateToDMY(latestDate),'vs',dateToDMY(prevDate));
