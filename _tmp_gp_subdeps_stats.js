const fs=require('fs');
const p=String.raw`C:\Users\gstim\.openclaw\workspace\Spar\GP Anlysis\Sub Departments 2025 vs 2026 v2.csv`;
const text=fs.readFileSync(p,'utf8');
const lines=text.split(/\r?\n/).map(l=>l.trim()).filter(Boolean);
const header=lines[0];
const cols=header.split(',');
const dateIdx=cols.indexOf('Date');
const subIdx=cols.indexOf('Sub-Dept.');
const subDeptNameIdx=cols.indexOf('Sub Department');
let dates=[];
let subCodes=new Set();
let subNames=new Set();
let rowCount=0;
for(let i=1;i<lines.length;i++){
  const parts=lines[i].split(',');
  if(parts.length!==cols.length) continue;
  const d=parts[dateIdx];
  const m=/^(\d{4})\/(\d{2})\/(\d{2})$/.exec(d||'');
  if(m){
    const dt=new Date(Date.UTC(+m[1],+m[2]-1,+m[3]));
    if(!isNaN(dt)) dates.push(dt);
  }
  const sCode=parts[subIdx];
  const sName=parts[subDeptNameIdx];
  if(sCode) subCodes.add(sCode);
  if(sName) subNames.add(sName);
  rowCount++;
}
const min=dates.reduce((a,b)=>a<b?a:b,dates[0]);
const max=dates.reduce((a,b)=>a>b?a:b,dates[0]);
function fmt(dt){return `${dt.getUTCFullYear()}-${String(dt.getUTCMonth()+1).padStart(2,'0')}-${String(dt.getUTCDate()).padStart(2,'0')}`;}
console.log(JSON.stringify({
  totalLines: lines.length,
  rowsCount: rowCount,
  colsCount: cols.length,
  dateRange: min&&max? `${fmt(min)} to ${fmt(max)}`: null,
  minDate: min? fmt(min): null,
  maxDate: max? fmt(max): null,
  uniqueSubDepts: subCodes.size,
  uniqueSubNames: subNames.size,
  parsedDates: dates.length
},null,2));
