const fs=require('fs');
const file=String.raw`C:\Users\gstim\.openclaw\workspace\Spar\HMR\HMR sub departments .csv`;
const text=fs.readFileSync(file,'utf8');
const lines=text.split(/\r?\n/).map(l=>l.trim()).filter(Boolean);

const cols=['Sub-Dept','Short Code','Description','Date','Opening Stock at CP','Purchases at CP','IDTs','Stock Adjustments at CP','Waste Adjustments at CP','Recipe Auto Produce at CP','Waste to Sales %','Sales at Cost','S.Take Var to Fin Stock','Fin S.Take Var to Sales %','Theo. Fin Closing Stock','Actual Stock at CP (Products)','Theo to Act Difference CP','Stock Variance (Last Stock Take) at CP','Act S.Take Var to Sales %','Sales Excl. VAT','Front End GP%','Actual Fin GP%','Calc Cost of Sales','Calc GP R','Sales Excl. VAT (%)','Stock Days CP'];

function num(x){
  if(x==null) return null;
  x=String(x).trim();
  if(!x) return null;
  x=x.replace(/\s+/g,'');
  const v=Number(x);
  return Number.isFinite(v)?v:null;
}
function parseDate(d){
  const m=/^([0-9]{2})\.([0-9]{2})\.([0-9]{4})$/.exec(d);
  if(!m) return null;
  return new Date(Date.UTC(+m[3],+m[2]-1,+m[1]));
}

const rows=[];
for(const line of lines){
  if(!/^-?\d/.test(line)) continue;
  const parts=line.split(',');
  if(parts.length!==26) continue;
  const r={};
  for(let i=0;i<26;i++) r[cols[i]]=parts[i];
  const d=parseDate(r.Date);
  if(!d) continue;
  r.d=d;
  for(const k of cols){
    if(['Sub-Dept','Short Code','Description','Date'].includes(k)) continue;
    r[k]=num(r[k]);
  }
  rows.push(r);
}

const latest=rows.reduce((a,r)=> r.d>a? r.d:a, new Date(0));
const prev=new Date(Date.UTC(latest.getUTCFullYear()-1, latest.getUTCMonth(), latest.getUTCDate()));

function dateStr(dt){
  const dd=String(dt.getUTCDate()).padStart(2,'0');
  const mm=String(dt.getUTCMonth()+1).padStart(2,'0');
  const yyyy=dt.getUTCFullYear();
  return `${dd}.${mm}.${yyyy}`;
}

const latestRows=rows.filter(r=>r.d.getTime()===latest.getTime());
const prevRows=rows.filter(r=>r.d.getTime()===prev.getTime());

const salesKey='Sales Excl. VAT';
const gpKey='Actual Fin GP%';

const salesPos2026 = latestRows.filter(r=>r[salesKey]!=null && r[salesKey]>0 && r[gpKey]!=null);
const salesPos2025 = prevRows.filter(r=>r[salesKey]!=null && r[salesKey]>0 && r[gpKey]!=null);

function makeRankMap(rs){
  const arr=rs.slice().sort((a,b)=>b[gpKey]-a[gpKey]);
  const map=new Map();
  arr.forEach((r,i)=>map.set(r['Short Code'], {rank:i+1}));
  return {arr,map};
}

const R26=makeRankMap(salesPos2026);
const R25=makeRankMap(salesPos2025);

const codes=[...R26.map.keys()].sort((a,b)=>R26.map.get(a).rank-R26.map.get(b).rank);

console.log(`YoY ranking (Actual Fin GP%), Sales Excl. VAT > 0 in 2026`);
console.log(`Latest: ${dateStr(latest)} | Prev: ${dateStr(prev)} | Candidates: 2026=${salesPos2026.length}, 2025=${salesPos2025.length}`);
console.log('Sub-Dept\tRank_2025\tRank_2026\tMove_26-25');
for(const code of codes){
  const r26=R26.map.get(code);
  const r25=R25.map.get(code);
  const rank25=r25? r25.rank : '—';
  const rank26=r26.rank;
  const move=r25? (rank26 - r25.rank) : '—';
  console.log(`${code}\t${rank25}\t${rank26}\t${move}`);
}
