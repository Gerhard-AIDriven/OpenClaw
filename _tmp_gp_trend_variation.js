const fs = require('fs');

const inputPath = String.raw`C:\Users\gstim\.openclaw\workspace\Spar\GP Anlysis\Sub Departments 2025 vs 2026 v2.csv`;

const text = fs.readFileSync(inputPath, 'utf8');

function parseCSV(str) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < str.length; i++) {
    const ch = str[i];

    if (ch === '"') {
      // Handle escaped quotes "" inside quoted fields
      if (inQuotes && str[i + 1] === '"') {
        field += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (!inQuotes && (ch === ',')) {
      row.push(field);
      field = '';
      continue;
    }

    if (!inQuotes && (ch === '\n' || ch === '\r')) {
      // Handle CRLF/standalone CR
      if (ch === '\r' && str[i + 1] === '\n') i++;
      // End row if there's content or any fields already accumulated
      row.push(field);
      field = '';
      // Trim trailing empty lines
      if (row.length > 1 || (row.length === 1 && row[0].trim() !== '')) rows.push(row);
      row = [];
      continue;
    }

    field += ch;
  }

  // Flush last field
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    if (row.length > 1 || (row.length === 1 && row[0].trim() !== '')) rows.push(row);
  }

  return rows;
}

function normColName(s) {
  return String(s)
    .replace(/\s+/g, ' ')
    .trim();
}

function num(x) {
  if (x === null || x === undefined) return null;
  x = String(x).trim();
  if (!x) return null;
  // remove thousand separators spaces
  x = x.replace(/\s+/g, '');
  const v = Number(x);
  return Number.isFinite(v) ? v : null;
}

function parseDate(d) {
  // YYYY/MM/DD
  const m = /^([0-9]{4})\/([0-9]{2})\/([0-9]{2})$/.exec(String(d).trim());
  if (!m) return null;
  const yyyy = +m[1], mm = +m[2], dd = +m[3];
  const dt = new Date(Date.UTC(yyyy, mm - 1, dd));
  return Number.isFinite(dt.getTime()) ? dt : null;
}

function linearRegressionSlope(xs, ys) {
  // slope for y = a + b*x
  // xs, ys arrays same length
  const n = xs.length;
  if (n < 2) return null;
  const meanX = xs.reduce((a, b) => a + b, 0) / n;
  const meanY = ys.reduce((a, b) => a + b, 0) / n;
  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i++) {
    const dx = xs[i] - meanX;
    num += dx * (ys[i] - meanY);
    den += dx * dx;
  }
  if (den === 0) return null;
  return num / den;
}

const rows = parseCSV(text);
if (rows.length < 2) {
  console.error('Not enough rows parsed:', rows.length);
  process.exit(1);
}

const header = rows[0].map(normColName);
// map columns
const idx = (name) => header.findIndex(h => h.toLowerCase() === name.toLowerCase());

// expected columns
const depNoIdx = idx('Department No');
const depNameIdx = idx('Department Name');
const subNoIdx = header.findIndex(h => h.toLowerCase().includes('sub- dept'));
const subNameIdx = header.findIndex(h => h.toLowerCase() === 'sub department' || h.toLowerCase().includes('sub department'));
const dateIdx = idx('Date');
const gpIdx = header.findIndex(h => h.toLowerCase() === 'actual fin gp%');

if (depNoIdx < 0 || depNameIdx < 0 || dateIdx < 0 || gpIdx < 0 || subNoIdx < 0 || subNameIdx < 0) {
  console.error('Column detection failed.', { depNoIdx, depNameIdx, subNoIdx, subNameIdx, dateIdx, gpIdx });
  console.error('Header:', header);
  process.exit(1);
}

const byKey = new Map();
function getKey(r){
  const depNo = r[depNoIdx];
  const depName = r[depNameIdx];
  const subCode = r[subNoIdx];
  const subDeptName = r[subNameIdx];
  return `${depNo}||${depName}||${subCode}||${subDeptName}`;
}

for (let i = 1; i < rows.length; i++) {
  const r = rows[i];
  if (!r || r.length < header.length) continue;

  const dt = parseDate(r[dateIdx]);
  if (!dt) continue;
  const year = dt.getUTCFullYear();
  if (year !== 2025 && year !== 2026) continue;

  const gp = num(r[gpIdx]);
  if (gp === null) continue;

  const key = getKey(r);
  if (!byKey.has(key)) {
    byKey.set(key, {
      depNo: r[depNoIdx],
      depName: r[depNameIdx],
      subCode: r[subNoIdx],
      subDeptName: r[subNameIdx],
      series: {2025: [], 2026: []}
    });
  }
  const entry = byKey.get(key);
  // x = days since epoch for stability
  const t = dt.getTime() / 86400000;
  entry.series[year].push({ t, gp });
}

// evaluate trend variation
const results = [];
for (const [key, obj] of byKey.entries()) {
  const s25 = obj.series[2025];
  const s26 = obj.series[2026];
  if (s25.length < 6 || s26.length < 6) continue;

  // sort by time
  s25.sort((a, b) => a.t - b.t);
  s26.sort((a, b) => a.t - b.t);

  const xs25 = s25.map(p => p.t);
  const ys25 = s25.map(p => p.gp);
  const xs26 = s26.map(p => p.t);
  const ys26 = s26.map(p => p.gp);

  const slope25 = linearRegressionSlope(xs25, ys25);
  const slope26 = linearRegressionSlope(xs26, ys26);
  if (slope25 === null || slope26 === null) continue;

  const first25 = ys25[0], last25 = ys25[ys25.length - 1];
  const first26 = ys26[0], last26 = ys26[ys26.length - 1];

  const delta25 = last25 - first25;
  const delta26 = last26 - first26;

  // varying trend: opposite direction by slope OR by endpoints
  const slopeOpp = (slope25 === 0 || slope26 === 0) ? false : (slope25 > 0) !== (slope26 > 0);
  const deltaOpp = (delta25 === 0 || delta26 === 0) ? false : (delta25 > 0) !== (delta26 > 0);

  // require both indicators to agree (reduces noise)
  if (!(slopeOpp && deltaOpp)) continue;

  results.push({
    depNo: obj.depNo,
    depName: obj.depName,
    subCode: obj.subCode,
    subDeptName: obj.subDeptName,
    n25: s25.length,
    n26: s26.length,
    slope25,
    slope26,
    delta25,
    delta26,
    score: Math.abs(slope25) + Math.abs(slope26) + Math.abs(delta25) + Math.abs(delta26)
  });
}

results.sort((a, b) => b.score - a.score);

const top = results.slice(0, 25);

function fmt(x){
  if (x === null) return '—';
  const r = Math.round(x * 100) / 100;
  return String(r);
}

let out = '';
out += `Sub-depts with GP% trend direction in 2026 different from 2025 (Actual Fin GP%), matched on both regression slope and start->end direction.\n`;
out += `Candidates analyzed: ${byKey.size}\n`;
out += `Matched sub-depts: ${results.length}\n`;
out += `Top ${top.length} by score (strongest opposite trend):\n`;

for (const r of top) {
  const dir25 = r.slope25 > 0 ? 'UP' : 'DOWN';
  const dir26 = r.slope26 > 0 ? 'UP' : 'DOWN';
  out += `- ${r.subDeptName} (Sub-Dept ${r.subCode}, Dept ${r.depName}) | 2025: ${dir25} (slope ${fmt(r.slope25)}, Δ ${fmt(r.delta25)}) ; 2026: ${dir26} (slope ${fmt(r.slope26)}, Δ ${fmt(r.delta26)}) | n25=${r.n25}, n26=${r.n26}\n`;
}

console.log(out);

fs.writeFileSync(String.raw`C:\Users\gstim\.openclaw\workspace\HMR_gp_trend_variation.json`, JSON.stringify({ generatedAt: new Date().toISOString(), results }, null, 2), 'utf8');
