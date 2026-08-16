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
  r.d=parseDate(r.Date);
  if(!r.d) continue;
  // numeric conversions
  for(const k of cols){
    if(['Sub-Dept','Short Code','Description','Date'].includes(k)) continue;
    r[k]=num(r[k]);
  }
  rows.push(r);
}

const salesKey='Sales Excl. VAT';
const gpKey='Actual Fin GP%';

function fmt(x){
  if(x==null) return '';
  return String(Math.round(x*100)/100);
}

function rankForDate(dateStr){
  // dateStr dd.mm.yyyy
  const m=/^([0-9]{2})\.([0-9]{2})\.([0-9]{4})$/.exec(dateStr);
  const dt=new Date(Date.UTC(+m[3],+m[2]-1,+m[1]));
  const candidates=rows.filter(r=>r.d.getTime()===dt.getTime() && r[salesKey]!=null && r[salesKey]!==0 && r[gpKey]!=null);
  candidates.sort((a,b)=>b[gpKey]-a[gpKey]);
  // ranks: rank by order (ties by order)
  const rankMap=new Map();
  candidates.forEach((r,i)=>{
    rankMap.set(r['Short Code'], {rank:i+1, gp:r[gpKey], sales:r[salesKey], desc:r.Description});
  });
  return {date:dateStr, candidatesCount:candidates.length, list:candidates, rankMap};
}

// determine latest and corresponding prev date by year-1 with same month/day
const allDates=[...new Set(rows.map(r=>r.d.toISOString().slice(0,10)))].sort();
const latest=new Date(allDates[allDates.length-1]);
const prev=new Date(Date.UTC(latest.getUTCFullYear()-1, latest.getUTCMonth(), latest.getUTCDate()));

function toDMY(dt){
  const dd=String(dt.getUTCDate()).padStart(2,'0');
  const mm=String(dt.getUTCMonth()+1).padStart(2,'0');
  const yyyy=dt.getUTCFullYear();
  return `${dd}.${mm}.${yyyy}`;
}

const latestStr=toDMY(latest);
const prevStr=toDMY(prev);

const R2026 = rankForDate(latestStr); // latest date likely 01.04.2026
const R2025 = rankForDate(prevStr);

function printTopBottom(R,label){
  const top=R.list.slice(0,10);
  const bottom=R.list.slice(-10).reverse();
  console.log(`\n${label} (${R.date}) candidates: ${R.candidatesCount}`);
  console.log('Top 10 by Actual Fin GP% (excluding Sales Excl. VAT = 0):');
  top.forEach((r,i)=>{
    console.log(`${i+1}. ${r['Short Code']} ${r.Description} | GP% ${fmt(r[gpKey])}`);
  });
  console.log('Bottom 10 by Actual Fin GP%:');
  bottom.forEach((r,i)=>{
    console.log(`${i+1}. ${r['Short Code']} ${r.Description} | GP% ${fmt(r[gpKey])}`);
  });
}

printTopBottom(R2026,'2026 ranking');
printTopBottom(R2025,'2025 ranking');

// YoY rank changes for sub depts that exist in both maps
const movers=[];
for(const [code, r26] of R2026.rankMap.entries()){
  const r25=R2025.rankMap.get(code);
  if(!r25) continue;
  const delta = r26.rank - r25.rank;
  // positive delta means worse (lower rank number is better)
  movers.push({code, desc:r26.desc, rank25:r25.rank, rank26:r26.rank, delta, gp25:r25.gp, gp26:r26.gp});
}

movers.sort((a,b)=>Math.abs(b.delta)-Math.abs(a.delta));

const focus = movers.filter(m=> (m.rank26<=10 || m.rank26>R2026.candidatesCount-10 || m.rank25<=10 || m.rank25>R2025.candidatesCount-10));
focus.sort((a,b)=>Math.abs(b.delta)-Math.abs(a.delta));

console.log(`\nYoY ranking movement (2026 vs 2025) for codes in top/bottom 10 of either year:`);
const show = focus.slice(0,12);
show.forEach(m=>{
  const dir = m.delta<0 ? 'up' : (m.delta>0 ? 'down' : '—');
  console.log(`${m.code}: ${m.rank25} -> ${m.rank26} (${dir} ${Math.abs(m.delta)} places), GP% ${fmt(m.gp25)} -> ${fmt(m.gp26)}`);
});
