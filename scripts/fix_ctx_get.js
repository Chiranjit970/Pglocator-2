const fs = require('fs');
const path = 'supabase/functions/server/index.ts';
let s = fs.readFileSync(path, 'utf8');
let orig = s;
s = s.replace(/c\.get\('userId'\)/g, "getCtxValue<string>(c, 'userId')");
s = s.replace(/c\.get\('userEmail'\)/g, "getCtxValue<string>(c, 'userEmail')");
s = s.replace(/const review = \{/g, 'const review: any = {');
if (s !== orig) {
  fs.writeFileSync(path, s, 'utf8');
  console.log('replacements applied');
} else {
  console.log('no changes');
}
