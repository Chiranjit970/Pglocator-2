const fs = require('fs');
const path = 'supabase/functions/server/index.ts';
let s = fs.readFileSync(path,'utf8');
const orig = s;
// Replace c.get('key') or c.get("key") with getCtxValue<any>(c, 'key')
s = s.replace(/c\.get\((['\"])(.*?)\1\)/g, (m, q, key) => `getCtxValue<any>(c, '${key}')`);
// Also make sure review object is typed any where it was previously declared as const review = {
 s = s.replace(/const review =\s*\{/g, 'const review: any = {');
if (s !== orig) {
  fs.writeFileSync(path, s, 'utf8');
  console.log('updated file');
} else {
  console.log('no changes');
}
