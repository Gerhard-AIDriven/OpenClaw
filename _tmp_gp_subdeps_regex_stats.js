const fs=require('fs');
const p=String.raw`C:\Users\gstim\.openclaw\workspace\Spar\GP Anlysis\Sub Departments 2025 vs 2026 v2.csv`;
const text=fs.readFileSync(p,'utf8');
const dateRe=/\b(\d{4})\/(\d{2})\/(\d{2})\b/g;
let m; let dates=[]; let countByYear={};
while((m=dateRe.exec(text))){
  const yyyy=+m[1], mm=+m[2], dd=+m[3];
  const dt=new Date(Date.UTC(yyyy,mm-1,dd));
  if(!isNaN(dt.getTime())) dates.push(dt);
  countByYear[m[1]]=(countByYear[m[1]]||0)+1;
}
function fmt(dt){return `${dt.getUTCFullYear()}-${String(dt.getUTCMonth()+1).padStart(2,'0')}-${String(dt.getUTCDate()).padStart(2,'0')}`;}
const min=dates.reduce((a,b)=>a<b?a:b,dates[0]);
const max=dates.reduce((a,b)=>a>b?a:b,dates[0]);
console.log(JSON.stringify({dateCount:dates.length,dateRange:dates.length?`${fmt(min)} to ${fmt(max)}`:null,byYear:countByYear},null,2));
