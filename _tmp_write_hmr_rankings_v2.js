const fs=require('fs');
const path=require('path');

const inputPath=String.raw`C:\Users\gstim\.openclaw\workspace\Spar\HMR\HMR sub departments .csv`;
const outDir=path.dirname(inputPath);
const outJson=path.join(outDir,'HMR_rankings.json');
const outHtml=path.join(outDir,'HMR Rankings.html');

const text=fs.readFileSync(inputPath,'utf8');
const lines=text.split(/\r?\n/).map(l=>l.trim()).filter(Boolean);

const cols=[
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
function dateStr(dt){
  const dd=String(dt.getUTCDate()).padStart(2,'0');
  const mm=String(dt.getUTCMonth()+1).padStart(2,'0');
  const yyyy=dt.getUTCFullYear();
  return `${dd}.${mm}.${yyyy}`;
}
function esc(s){
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
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

const latestRows=rows.filter(r=>r.d.getTime()===latest.getTime());
const prevRows=rows.filter(r=>r.d.getTime()===prev.getTime());

const salesKey='Sales Excl. VAT';
const frontKey='Front End GP%';
const actualKey='Actual Fin GP%';

function buildRankMap(rs){
  const cand = rs
    .filter(r=> r[salesKey]!=null && r[salesKey]>0 && r[frontKey]!=null && r[actualKey]!=null)
    .slice()
    .sort((a,b)=>b[salesKey]-a[salesKey]);

  const map=new Map();
  cand.forEach((r,i)=>{
    map.set(r['Short Code'], {
      rank:i+1,
      sales:r[salesKey],
      frontGP:r[frontKey],
      actualGP:r[actualKey],
      desc:r.Description
    });
  });
  return {cand,map};
}

const R26=buildRankMap(latestRows);
const R25=buildRankMap(prevRows);

const codes=new Set([...R26.map.keys(), ...R25.map.keys()]);

const codeList=[...codes].sort((a,b)=>{
  const ra=R26.map.get(a)?.rank ?? 1e9;
  const rb=R26.map.get(b)?.rank ?? 1e9;
  if(ra!==rb) return ra-rb;
  const r25a=R25.map.get(a)?.rank ?? 1e9;
  const r25b=R25.map.get(b)?.rank ?? 1e9;
  if(r25a!==r25b) return r25a-r25b;
  return a.localeCompare(b);
});

function round2(x){
  if(x==null) return null;
  return Math.round(x*100)/100;
}

const results=[];
for(const code of codeList){
  const a26=R26.map.get(code);
  const a25=R25.map.get(code);
  const rank25=a25? a25.rank : null;
  const rank26=a26? a26.rank : null;
  // Change direction: 25 -> 26 => rank25 - rank26 (so negative means it moved up in rank #)
  const move25minus26=(rank25!=null && rank26!=null) ? (rank25 - rank26) : null;

  results.push({
    shortCode: code,
    description: (a26?.desc ?? a25?.desc ?? null),
    rank2025: rank25,
    sales2025: a25? round2(a25.sales) : null,
    frontGP2025: a25? round2(a25.frontGP) : null,
    actualGP2025: a25? round2(a25.actualGP) : null,
    rank2026: rank26,
    sales2026: a26? round2(a26.sales) : null,
    frontGP2026: a26? round2(a26.frontGP) : null,
    actualGP2026: a26? round2(a26.actualGP) : null,
    movement_25_minus_26: move25minus26
  });
}

const payload={
  inputFile: path.basename(inputPath),
  latestDate: dateStr(latest),
  prevDate: dateStr(prev),
  rankingMetric: 'Sales Excl. VAT (desc)',
  filter: {salesExclVAT_gt: 0, requireFrontGP: true, requireActualFinGP: true},
  candidates: {count2026: R26.cand.length, count2025: R25.cand.length},
  movementDefinition: 'movement_25_minus_26 = rank2025 - rank2026',
  results
};

fs.writeFileSync(outJson, JSON.stringify(payload,null,2), 'utf8');

let html='';
html += '<!doctype html><html><head><meta charset="utf-8"/>';
html += '<title>HMR Rankings</title>';
html += '<style>body{font-family:Arial,Helvetica,sans-serif;margin:20px}table{border-collapse:collapse;width:100%}th,td{border:1px solid #ddd;padding:8px;font-size:13px;vertical-align:top}th{background:#f5f5f5}caption{caption-side:top;text-align:left;font-weight:700;margin-bottom:10px}.muted{color:#666;font-size:12px}</style>';
html += '</head><body>';
html += `<h2>HMR Rankings</h2>`;
html += `<div class="muted">Input: ${esc(payload.inputFile)}<br/>Latest: ${esc(payload.latestDate)} vs Prev: ${esc(payload.prevDate)}<br/>Ranking metric: ${esc(payload.rankingMetric)}<br/>Filter: Sales Excl. VAT &gt; 0 (and Front GP% &amp; Actual Fin GP% present)<br/>Movement definition: ${esc(payload.movementDefinition)}</div>`;
html += '<table>';
html += '<thead><tr>';
html += '<th>Short Code</th><th>Description</th>';
html += '<th>Rank 2025</th><th>Sales 2025</th><th>Front GP% 2025</th><th>Actual Fin GP% 2025</th>';
html += '<th>Rank 2026</th><th>Sales 2026</th><th>Front GP% 2026</th><th>Actual Fin GP% 2026</th>';
html += '<th>Movement (25-26)</th>';
html += '</tr></thead><tbody>';

for(const r of results){
  const rowVal=(v)=> (v==null? '—' : esc(v));
  html += '<tr>';
  html += `<td>${esc(r.shortCode)}</td>`;
  html += `<td>${esc(r.description ?? '')}</td>`;
  html += `<td>${r.rank2025==null? '—': r.rank2025}</td>`;
  html += `<td>${r.sales2025==null? '—': r.sales2025}</td>`;
  html += `<td>${r.frontGP2025==null? '—': r.frontGP2025}</td>`;
  html += `<td>${r.actualGP2025==null? '—': r.actualGP2025}</td>`;
  html += `<td>${r.rank2026==null? '—': r.rank2026}</td>`;
  html += `<td>${r.sales2026==null? '—': r.sales2026}</td>`;
  html += `<td>${r.frontGP2026==null? '—': r.frontGP2026}</td>`;
  html += `<td>${r.actualGP2026==null? '—': r.actualGP2026}</td>`;
  html += `<td>${r.movement_25_minus_26==null? '—': r.movement_25_minus_26}</td>`;
  html += '</tr>';
}

html += '</tbody></table>';
html += '</body></html>';

fs.writeFileSync(outHtml, html, 'utf8');

console.log('Wrote:', outJson);
console.log('Wrote:', outHtml);
