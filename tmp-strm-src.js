const fs = require('fs');
const path = require('path');
const js = fs.readFileSync(path.join(process.env.TEMP, 'strm-index.js'), 'utf8');

const idx = js.indexOf('wW=new URLSearchParams(location.search)');
console.log(js.slice(idx, idx + 2500));

console.log('\n\n==== TW usages ====');
let i = 0;
let c = 0;
while ((i = js.indexOf('TW', i)) !== -1 && c < 20) {
  // only interesting nearby
  const ctx = js.slice(Math.max(0, i - 40), i + 80);
  if (/src|session|source|video|load|play/i.test(ctx)) {
    console.log(JSON.stringify(ctx));
    c++;
  }
  i += 2;
}
