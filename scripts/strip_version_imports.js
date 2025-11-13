const fs = require('fs');
const path = require('path');
function walk(dir, arr) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full, arr);
    else if (/\.(ts|tsx|js|jsx)$/.test(e.name)) arr.push(full);
  }
}

const files = [];
walk(path.join(__dirname, '..', 'src'), files);
let changed = 0;
for (const f of files) {
  let s = fs.readFileSync(f, 'utf8');
  const orig = s;
  // Replace module@version in import/require/from statements
  s = s.replace(/(['"])(@?[^'"\/]+(?:\/[^'"@]+)*?)@([\d][^'"\/]*)\1/g, (m, q, name) => `${q}${name}${q}`);
  if (s !== orig) {
    fs.writeFileSync(f, s, 'utf8');
    changed++;
    console.log('patched', f);
  }
}
console.log('done', changed, 'files');
