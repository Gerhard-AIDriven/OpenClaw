const fs=require('fs');
const p=String.raw`C:\Users\gstim\.openclaw\workspace\Spar\GP Anlysis\Departments 2025 vs 2026.csv`;
const text=fs.readFileSync(p,'utf8');
const lines=text.split(/\r?\n/).map(l=>l.trim()).filter(Boolean);
let dates=[];
for(const l of lines){
  const m=/\b(\d{2})\.(\d{2})\.(\d{4})\b/.exec(l);
  if(m){
    const d=new Date(Date.UTC(+m[3],+m[2]-1,+m[1]));
    dates.push({d:m[0], date:d, y:+m[3]});
  }
}
const min=dates.reduce((a,b)=>a.date<b.date?a:b, dates[0]);
const max=dates.reduce((a,b)=>a.date>b.date?a:b, dates[0]);
console.log(JSON.stringify({
  nonEmptyLines: lines.length,
  estimatedRows: Math.max(0, lines.length-1),
  dateRange: {from: min?.d, to: max?.d},
  countDates: dates.length
},null,2));
