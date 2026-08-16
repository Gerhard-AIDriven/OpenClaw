const fs=require('fs');
const file=String.raw`C:\Users\gstim\.openclaw\workspace\Spar\HMR\HMR sub departments .csv`;
const text=fs.readFileSync(file,'utf8');
const lines=text.split(/\r?\n/).map(l=>l.trim()).filter(Boolean);

const cols=['Sub-Dept','Short Code','Description','Date','Opening Stock at CP','Purchases at CP','IDTs','Stock Adjustments at CP','Waste Adjustments at CP','Recipe Auto Produce at CP','Waste to Sales %','Sales at Cost','S.Take Var to Fin Stock','Fin S.Take Var to Sales %','Theo. Fin Closing Stock','Actual Stock at CP (Products)','Theo to Act Difference CP','Stock Variance (Last Stock Take) at CP','Act S.Take Var to Sales %','Sales Excl. VAT','Front End GP%','Actual Fin GP%','Calc Cost of Sales','Calc GP R','Sales Excl. VAT (%)','Stock Days CP'];

function num(x){
  if(x==null) return null;
  x=String(x).trim();
  if(!x) return null;
  x=x.replace(/\s+/g,''); // remove thousand-sep spaces
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
  for(const k of cols){
    if(['Sub-Dept','Short Code','Description','Date'].includes(k)) continue;
    r[k]=num(r[k]);
  }
  rows.push(r);
}

const maxD=rows.reduce((a,r)=>r.d>a?r.d:a,new Date(0));
const latest=rows.filter(r=>r.d.getTime()===maxD.getTime());

const salesKey='Sales Excl. VAT';
const gpKey='Actual Fin GP%';

const candidates=latest.filter(r=>r[salesKey]!=null && r[salesKey]!==0 && r[gpKey]!=null);

candidates.sort((a,b)=>b[gpKey]-a[gpKey]);
const top=candidates.slice(0,10);
const bottom=candidates.slice(-10).reverse();

function fmt(x){return x==null?'':(Math.round(x*100)/100).toString();}

console.log('Date', maxD.toISOString().slice(0,10));
console.log('Candidates', candidates.length);

console.log('\nTOP 10 (Actual Fin GP%)');
for(let i=0;i<top.length;i++){
  const r=top[i];
  console.log(`${i+1}. ${r['Short Code']} ${r.Description} | GP% ${fmt(r[gpKey])} | SalesExVAT ${fmt(r[salesKey])}`);
}

console.log('\nBOTTOM 10 (Actual Fin GP%)');
for(let i=0;i<bottom.length;i++){
  const r=bottom[i];
  console.log(`${i+1}. ${r['Short Code']} ${r.Description} | GP% ${fmt(r[gpKey])} | SalesExVAT ${fmt(r[salesKey])}`);
}
