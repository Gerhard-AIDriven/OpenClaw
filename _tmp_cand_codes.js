const fs=require('fs');
const file=String.raw`C:\Users\gstim\.openclaw\workspace\Spar\HMR\HMR sub departments .csv`;
const text=fs.readFileSync(file,'utf8');
const lines=text.split(/\r?\n/).map(l=>l.trim()).filter(Boolean);
const fullCols=[
  'Sub-Dept','Short Code','Description','Date',
  'Opening Stock at CP','Purchases at CP','IDTs','Stock Adjustments at CP','Waste Adjustments at CP','Recipe Auto Produce at CP','Waste to Sales %','Sales at Cost','S.Take Var to Fin Stock','Fin S.Take Var to Sales %','Theo. Fin Closing Stock','Actual Stock at CP (Products)','Theo to Act Difference CP','Stock Variance (Last Stock Take) at CP','Act S.Take Var to Sales %','Sales Excl. VAT','Front End GP%','Actual Fin GP%','Calc Cost of Sales','Calc GP R','Sales Excl. VAT (%)','Stock Days CP'
];
function num(x){if(x==null) return null; x=String(x).trim(); if(!x) return null; x=x.replace(/\s+/g,''); const v=Number(x); return Number.isFinite(v)?v:null;}
function parseDate(d){const m=/^([0-9]{2})\.([0-9]{2})\.([0-9]{4})$/.exec(d); if(!m) return null; return new Date(Date.UTC(+m[3],+m[2]-1,+m[1]));}

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

const latest=rows.reduce((a,r)=>r.d>a?r.d:a,new Date(0));
const prev=new Date(Date.UTC(latest.getUTCFullYear()-1, latest.getUTCMonth(), latest.getUTCDate()));

const salesKey='Sales Excl. VAT';
const frontKey='Front End GP%';
const actualKey='Actual Fin GP%';

function candCodes(dt){
  return rows.filter(r=>r.d.getTime()===dt.getTime())
    .filter(r=> r[salesKey]!=null && r[salesKey]>0 && r[frontKey]!=null && r[actualKey]!=null)
    .map(r=>r['Short Code']);
}

console.log('Latest', latest.toISOString().slice(0,10));
console.log('Cand count 2026', candCodes(latest).length);
console.log(candCodes(latest).sort().join(', '));

console.log('Prev', prev.toISOString().slice(0,10));
console.log('Cand count 2025', candCodes(prev).length);
console.log(candCodes(prev).sort().join(', '));
