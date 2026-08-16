const fs = require('fs');

const inputPath = String.raw`C:\Users\gstim\.openclaw\workspace\Spar\GP Anlysis\Sub Departments 2025 vs 2026 v2.csv`;
const outJson = String.raw`C:\Users\gstim\.openclaw\workspace\HMR_gp_frontend_trend_analysis.json`;

function parseCSV(str) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < str.length; i++) {
    const ch = str[i];

    if (ch === '"') {
      if (inQuotes && str[i + 1] === '"') {
        field += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (!inQuotes && ch === ',') {
      row.push(field);
      field = '';
      continue;
    }

    if (!inQuotes && (ch === '\n' || ch === '\r')) {
      if (ch === '\r' && str[i + 1] === '\n') i++;
      row.push(field);
      field = '';
      // avoid trailing blank lines
      if (row.some(v => String(v).trim() !== '') && row.length > 1) rows.push(row);
      row = [];
      continue;
    }

    field += ch;
  }

  if (field.length || row.length) {
    row.push(field);
    if (row.some(v => String(v).trim() !== '') && row.length > 1) rows.push(row);
  }

  return rows;
}

function normColName(s) {
  return String(s || '').replace(/\s+/g, ' ').trim();
}

function parseNumber(x) {
  if (x === null || x === undefined) return null;
  x = String(x).trim();
  if (!x) return null;
  x = x.replace(/\s+/g, ''); // remove thousand separators
  const v = Number(x);
  return Number.isFinite(v) ? v : null;
}

function parseDate(d) {
  const m = /^([0-9]{4})\/([0-9]{2})\/([0-9]{2})$/.exec(String(d).trim());
  if (!m) return null;
  const yyyy = +m[1], mm = +m[2], dd = +m[3];
  const dt = new Date(Date.UTC(yyyy, mm - 1, dd));
  return Number.isFinite(dt.getTime()) ? dt : null;
}

function mean(arr) {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function linearRegression(xs, ys) {
  // y = a + b*x; return slope b and significance approx
  const n = xs.length;
  if (n < 3) return null;
  const xbar = mean(xs);
  const ybar = mean(ys);
  let Sxx = 0;
  let Sxy = 0;
  for (let i = 0; i < n; i++) {
    const dx = xs[i] - xbar;
    Sxx += dx * dx;
    Sxy += dx * (ys[i] - ybar);
  }
  if (Sxx === 0) return null;
  const slope = Sxy / Sxx;
  // intercept not needed

  // SSE
  let SSE = 0;
  for (let i = 0; i < n; i++) {
    const yhat = ybar + slope * (xs[i] - xbar);
    const e = ys[i] - yhat;
    SSE += e * e;
  }
  const df = n - 2;
  if (df <= 0) return null;
  const MSE = SSE / df;
  const seSlope = Math.sqrt(MSE / Sxx);
  if (!Number.isFinite(seSlope) || seSlope === 0) {
    return { slope, seSlope: 0, t: Infinity, p: 0, r2: null };
  }
  const t = slope / seSlope;

  // approximate p-value using normal CDF
  // p = 2*(1-Phi(|t|)). For df ~ 15-20, normal approx is acceptable.
  const phi = (z) => {
    // Abramowitz and Stegun approximation for error function
    // Phi(z) = 0.5*(1+erf(z/sqrt(2)))
    const sign = z < 0 ? -1 : 1;
    const absz = Math.abs(z);
    const a1 = 0.254829592;
    const a2 = -0.284496736;
    const a3 = 1.421413741;
    const a4 = -1.453152027;
    const a5 = 1.061405429;
    const p = 0.3275911;
    const t2 = 1 / (1 + p * absz);
    const erf = 1 - (((((a5 * t2 + a4) * t2) + a3) * t2 + a2) * t2 + a1) * t2) * Math.exp(-absz * absz);
    const erfSigned = sign * erf;
    return 0.5 * (1 + erfSigned);
  };
  const pval = 2 * (1 - phi(Math.abs(t)));

  // R^2
  let SST = 0;
  for (let i = 0; i < n; i++) {
    const dy = ys[i] - ybar;
    SST += dy * dy;
  }
  const r2 = SST === 0 ? null : 1 - SSE / SST;

  return { slope, seSlope, t, p: pval, r2 };
}

function esc(s) {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

const text = fs.readFileSync(inputPath, 'utf8');
const raw = parseCSV(text);
if (raw.length < 2) throw new Error('CSV parse failed');

const header = raw[0].map(normColName);
const idx = (name) => header.findIndex(h => h.toLowerCase() === name.toLowerCase());
const findContains = (needle) => {
  const needleL = needle.toLowerCase();
  return header.findIndex(h => h.toLowerCase().includes(needleL));
};

const depNoIdx = idx('Department No');
const depNameIdx = idx('Department Name');
const subNoIdx = findContains('sub- dept');
const subNameIdx = idx('Sub Department');
const dateIdx = idx('Date');
const gpIdx = idx('Front End GP%');

if ([depNoIdx, depNameIdx, subNoIdx, subNameIdx, dateIdx, gpIdx].some(i => i < 0)) {
  console.error('Header columns not found. Indices:', { depNoIdx, depNameIdx, subNoIdx, subNameIdx, dateIdx, gpIdx });
  console.error('Header:', header);
  process.exit(1);
}

// group by department + sub-dept identifiers
const groups = new Map();
function keyOf(r) {
  return `${r[depNoIdx]}||${r[depNameIdx]}||${r[subNoIdx]}||${r[subNameIdx]}`;
}

for (let i = 1; i < raw.length; i++) {
  const r = raw[i];
  if (!r || r.length < header.length) continue;

  const dt = parseDate(r[dateIdx]);
  if (!dt) continue;
  const year = dt.getUTCFullYear();
  if (year !== 2025 && year !== 2026) continue;

  const gp = parseNumber(r[gpIdx]);
  if (gp === null) continue;

  const k = keyOf(r);
  if (!groups.has(k)) {
    groups.set(k, {
      depNo: r[depNoIdx],
      depName: r[depNameIdx],
      subCode: r[subNoIdx],
      subName: r[subNameIdx],
      series: { 2025: [], 2026: [] }
    });
  }
  const g = groups.get(k);
  const t = dt.getTime() / 86400000; // days
  g.series[year].push({ t, gp });
}

const minPoints = 10;
const alpha = 0.10; // significance threshold for slope

const perGroup = [];
for (const g of groups.values()) {
  const s25 = g.series[2025];
  const s26 = g.series[2026];
  if (s25.length < minPoints || s26.length < minPoints) continue;

  s25.sort((a, b) => a.t - b.t);
  s26.sort((a, b) => a.t - b.t);

  const xs25 = s25.map(p => p.t);
  const ys25 = s25.map(p => p.gp);
  const xs26 = s26.map(p => p.t);
  const ys26 = s26.map(p => p.gp);

  const reg25 = linearRegression(xs25, ys25);
  const reg26 = linearRegression(xs26, ys26);
  if (!reg25 || !reg26 || !Number.isFinite(reg25.slope) || !Number.isFinite(reg26.slope)) continue;

  const slopePerWeek25 = reg25.slope * 7;
  const slopePerWeek26 = reg26.slope * 7;

  const delta25 = ys25[ys25.length - 1] - ys25[0];
  const delta26 = ys26[ys26.length - 1] - ys26[0];

  const slopeOpp = slopePerWeek25 === 0 || slopePerWeek26 === 0 ? false : (slopePerWeek25 > 0) !== (slopePerWeek26 > 0);
  const deltaOpp = delta25 === 0 || delta26 === 0 ? false : (delta25 > 0) !== (delta26 > 0);

  const sig25 = reg25.p !== null && reg25.p <= alpha;
  const sig26 = reg26.p !== null && reg26.p <= alpha;

  const significantDifferent = slopeOpp && deltaOpp && sig25 && sig26;

  perGroup.push({
    depNo: g.depNo,
    depName: g.depName,
    subCode: g.subCode,
    subName: g.subName,
    n25: s25.length,
    n26: s26.length,
    slopePerWeek25,
    slopePerWeek26,
    delta25,
    delta26,
    p25: reg25.p,
    p26: reg26.p,
    r2_25: reg25.r2,
    r2_26: reg26.r2,
    slopeOpp,
    deltaOpp,
    sig25,
    sig26,
    significantDifferent
  });
}

// rank per department by 2026 slope (descending)
const byDept = new Map();
for (const pg of perGroup) {
  const k = `${pg.depNo}||${pg.depName}`;
  if (!byDept.has(k)) byDept.set(k, []);
  byDept.get(k).push(pg);
}

for (const arr of byDept.values()) {
  arr.sort((a, b) => b.slopePerWeek26 - a.slopePerWeek26);
}

const reversals = perGroup.filter(x => x.significantDifferent);
reversals.sort((a, b) => Math.abs((b.slopePerWeek26 - b.slopePerWeek25)) - Math.abs((a.slopePerWeek26 - a.slopePerWeek25)));

// Top reversals overall
const topReversals = reversals.slice(0, 30);

// department summary counts
const deptCounts = new Map();
for (const r of reversals) {
  const k = `${r.depNo}||${r.depName}`;
  deptCounts.set(k, (deptCounts.get(k) || 0) + 1);
}

const deptSummary = [...deptCounts.entries()].map(([k, c]) => {
  const [depNo, depName] = k.split('||');
  return { depNo, depName, count: c };
});
deptSummary.sort((a, b) => b.count - a.count);

function r2f(x) {
  return x == null ? null : Math.round(x * 1000) / 1000;
}
function numf(x) {
  return Math.round(x * 100) / 100;
}

let report = '';
report += `Front End GP% trend analysis (regression slope, YoY 2025 vs 2026)\n`;
report += `Input: ${inputPath.split('\\').slice(-3).join('\\')}\n`;
report += `Groups analysed (minPoints=${minPoints}): ${perGroup.length}\n`;
report += `Trend reversal criteria: slopeOpp && deltaOpp && p25<=${alpha} && p26<=${alpha} (two-sided approx)\n`;
report += `Significant reversals matched: ${reversals.length}\n\n`;

report += `Departments with trend reversals (top by count):\n`;
for (const d of deptSummary.slice(0, 12)) {
  report += `- ${d.depNo} ${d.depName}: ${d.count}\n`;
}
if (deptSummary.length === 0) report += `- none found\n`;

report += `\nTop reversal sub-depts (strongest slope change):\n`;
for (const r of topReversals.slice(0, 15)) {
  const sign = (x) => (x > 0 ? 'UP' : 'DOWN');
  report += `- ${r.depNo} ${r.depName} / ${r.subCode} ${r.subName}: `;
  report += `2025 ${sign(r.slopePerWeek25)} slope ${numf(r.slopePerWeek25)} per week (p=${numf(r.p25)}), `;
  report += `2026 ${sign(r.slopePerWeek26)} slope ${numf(r.slopePerWeek26)} per week (p=${numf(r.p26)}); `;
  report += `Δ 2025 ${numf(r.delta25)} vs Δ 2026 ${numf(r.delta26)}\n`;
}

// per-department ranking quick top/bottom
report += `\nPer-department ranking snapshot (2026 slope): top 5 & bottom 5\n`;
for (const d of deptSummary.slice(0, 10)) {
  const key = `${d.depNo}||${d.depName}`;
  const arr = byDept.get(key) || [];
  if (!arr.length) continue;
  const top = arr.slice(0, 5);
  const bot = arr.slice(-5).reverse();
  report += `\n- ${d.depNo} ${d.depName} (total sub-depts in set: ${arr.length})\n`;
  report += `  Top slopes (UP):\n`;
  for (const x of top) report += `   * ${x.subCode} ${x.subName}: ${numf(x.slopePerWeek26)} /week (p26=${numf(x.p26)})\n`;
  report += `  Bottom slopes (DOWN):\n`;
  for (const x of bot) report += `   * ${x.subCode} ${x.subName}: ${numf(x.slopePerWeek26)} /week (p26=${numf(x.p26)})\n`;
}

fs.writeFileSync(outJson, JSON.stringify({ generatedAt: new Date().toISOString(), minPoints, alpha, perGroupCount: perGroup.length, reversalsCount: reversals.length, reversals: topReversals, deptSummary, perGroup }, null, 2), 'utf8');

// HTML brief report
const outHtml = String.raw`C:\Users\gstim\.openclaw\workspace\HMR gp frontend trend analysis.html`;
let html = '';
html += '<!doctype html><html><head><meta charset="utf-8"/>';
html += '<title>HMR gp frontend trend analysis</title>';
html += '<style>body{font-family:Arial,Helvetica,sans-serif;margin:20px}pre{white-space:pre-wrap;background:#f7f7f7;padding:12px;border-radius:6px}table{border-collapse:collapse;width:100%}th,td{border:1px solid #ddd;padding:8px;font-size:13px}th{background:#f5f5f5}</style>';
html += '</head><body>';
html += '<h2>Front End GP% trend analysis (2025 vs 2026)</h2>';
html += `<div><b>Criteria:</b> slopeOpp && deltaOpp && p25<=${alpha} && p26<=${alpha}. <br/><b>minPoints:</b> ${minPoints}. <br/><b>Groups:</b> ${perGroup.length}. <br/><b>Significant reversals:</b> ${reversals.length}.</div>`;
html += '<h3>Top reversals</h3>';
html += '<table><thead><tr><th>Dept</th><th>Sub-dept</th><th>2025 slope/wk</th><th>2025 p</th><th>2026 slope/wk</th><th>2026 p</th><th>Δ2025</th><th>Δ2026</th></tr></thead><tbody>';
for (const r of topReversals.slice(0, 30)) {
  html += '<tr>';
  html += `<td>${esc(r.depNo)} ${esc(r.depName)}</td>`;
  html += `<td>${esc(r.subCode)} ${esc(r.subName)}</td>`;
  html += `<td>${esc(numf(r.slopePerWeek25))}</td>`;
  html += `<td>${esc(numf(r.p25))}</td>`;
  html += `<td>${esc(numf(r.slopePerWeek26))}</td>`;
  html += `<td>${esc(numf(r.p26))}</td>`;
  html += `<td>${esc(numf(r.delta25))}</td>`;
  html += `<td>${esc(numf(r.delta26))}</td>`;
  html += '</tr>';
}
html += '</tbody></table>';
html += '<h3>Summary</h3>';
html += `<pre>${esc(report)}</pre>`;
html += `</body></html>`;
fs.writeFileSync(outHtml, html, 'utf8');

console.log(report);
console.log(`\nSaved JSON: ${outJson}`);
console.log(`Saved HTML: ${outHtml}`);
