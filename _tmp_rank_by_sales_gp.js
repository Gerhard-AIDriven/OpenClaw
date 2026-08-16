const fs=require('fs');
const file=String.raw`C:\Users\gstim\.openclaw\workspace\Spar\HMR\HMR sub departments .csv`;
const text=fs.readFileSync(file,'utf8');
const lines=text.split(/\r?\n/).map(l=>l.trim()).filter(Boolean);

const cols=['Sub-Dept','Short Code','Description','Date','Opening Stock at CP','Purchases at CP','IDTs','Stock Adjustments at CP','Waste Adjustments at CP','Recipe Auto Produce at CP','Waste to Sales %','Sales at Cost','S.Take Var to Fin Stock','Fin S.Take Var to Sales %','Theo. Fin Closing Stock','Actual Stock at CP (Products)','Theo to Act Difference CP','Stock Variance (Last Stock Take) at CP','Act S.Take Var to Sales %','Sales Excl. VAT','Front End GP%','Actual Fin GP%','Calc Cost of Sales','Calc GP R','Sales Excl. VAT (%)','Stock Days CP'];

// NOTE: source file header has 26 cols; we keep exact order as earlier known.
const fullCols=[
  'Sub-Dept','Short Code','Description','Date',
  'Opening Stock at CP','Purchases at CP','IDTs','Stock Adjustments at CP','Waste Adjustments at CP','Recipe Auto Produce at CP','Waste to Sales %','Sales at Cost','S.Take Var to Fin Stock','Fin S.Take Var to Sales %','Theo. Fin Closing Stock','Actual Stock at CP (Products)','Theo to Act Difference CP','Stock Variance (Last Stock Take) at CP','Act S.Take Var to Sales %','Sales Excl. VAT','Front End GP%','Actual Fin GP%','Calc Cost of Sales','Calc GP R','Sales Excl. VAT (%)','Stock Days CP'
];

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
  for(let i=0;i<26;i++) r[fullCols[i]]=parts[i];
  const d=parseDate(r.Date);
  if(!d) continue;
  r.d=d;
  for(const k of fullCols){
    if(['Sub-Dept','Short Code','Description','Date'].includes(k)) continue;
    r[k]=num(r[k]);
  }
  rows.push(r);
}

const latest=rows.reduce((a,r)=> r.d>a? r.d:a, new Date(0));
const prev=new Date(Date.UTC(latest.getUTCFullYear()-1, latest.getUTCMonth(), latest.getUTCDate()));

const salesKey='Sales Excl. VAT';
const frontKey='Front End GP%';
const actualKey='Actual Fin GP%';

function dateStr(dt){
  const dd=String(dt.getUTCDate()).padStart(2,'0');
  const mm=String(dt.getUTCMonth()+1).padStart(2,'0');
  const yyyy=dt.getUTCFullYear();
  return `${dd}.${mm}.${yyyy}`;
}

const latestRows=rows.filter(r=>r.d.getTime()===latest.getTime());
const prevRows=rows.filter(r=>r.d.getTime()===prev.getTime());

function makeRank(rs){
  const cand=rs.filter(r=> r[salesKey]!=null && r[salesKey]!==0 && r[salesKey]>0 && r[frontKey]!=null && r[actualKey]!=null);
  cand.sort((a,b)=>b[salesKey]-a[salesKey]);
  const map=new Map();
  cand.forEach((r,i)=>map.set(r['Short Code'], {rank:i+1, sales:r[salesKey], front:r[frontKey], actual:r[actualKey], desc:r.Description}));
  return {cand,map};
}

const R26=makeRank(latestRows);
const R25=makeRank(prevRows);

// Union of codes from either year ranks
const codes=new Set([...R26.map.keys(), ...R25.map.keys()]);
// Sort by 2026 rank, then 2025 rank, else code.
const codeList=[...codes].sort((a,b)=>{
  const ra=R26.map.get(a)?.rank ?? 1e9;
  const rb=R26.map.get(b)?.rank ?? 1e9;
  if(ra!==rb) return ra-rb;
  const r25a=R25.map.get(a)?.rank ?? 1e9;
  const r25b=R25.map.get(b)?.rank ?? 1e9;
  if(r25a!==r25b) return r25a-r25b;
  return a.localeCompare(b);
});

function fmtMoney(x){
  if(x==null) return '—';
  return String(Math.round(x*100)/100);
}
function fmtGP(x){
  if(x==null) return '—';
  return String(Math.round(x*100)/100);
}

let out='Rank by Sales Excl. VAT (Sales Excl. VAT > 0), with Front End GP% and Actual Fin GP%\n';
out+=`Latest: ${dateStr(latest)} | Prev: ${dateStr(prev)} | Candidates: 2026=${R26.cand.length}, 2025=${R25.cand.length}\n\n`;
out+='ShortCode\tDescription\tRank_2025\tSales_2025\tFrontGP_2025\tActualGP_2025\tRank_2026\tSales_2026\tFrontGP_2026\tActualGP_2026\tMove(26-25)\n';

for(const code of codeList){
  const r26=R26.map.get(code);
  const r25=R25.map.get(code);
  const rank25=r25?.rank ?? '—';
  const rank26=r26?.rank ?? '—';
  const move=(typeof rank25==='number' && typeof rank26==='number') ? (rank26-rank25) : '—';
  out+=`${code}\t${r26?.desc ?? r25?.desc ?? ''}\t${rank25}\t${fmtMoney(r25?.sales)}\t${fmtGP(r25?.front)}\t${fmtGP(r25?.actual)}\t${rank26}\t${fmtMoney(r26?.sales)}\t${fmtGP(r26?.front)}\t${fmtGP(r26?.actual)}\t${move}\n`;
}

console.log(out);
