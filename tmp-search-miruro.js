const fs = require('fs');
const path = require('path');
const js = fs.readFileSync(path.join(process.env.TEMP, 'miruro-index.js'), 'utf8');

const patterns = [
  'iframe',
  'PLAYER_ORIGIN',
  'playerOrigin',
  'strm',
  'keeply',
  'anikoto',
  'icarus',
  '"sun"',
  '"bee"',
  'embed',
  'postMessage',
  '?ep=',
  'host=',
  'window.env',
];

for (const p of patterns) {
  let idx = 0;
  let count = 0;
  while ((idx = js.indexOf(p, idx)) !== -1 && count < 3) {
    console.log(p, '=>', JSON.stringify(js.slice(Math.max(0, idx - 80), idx + 120)));
    console.log('====');
    idx += p.length;
    count++;
  }
  if (count === 0) console.log(p, '=> NONE');
}

const re =
  /["']([^"']*(?:player|embed|iframe|strm|host|anikoto|icarus|sun|bee)[^"']*)["']/gi;
const set = new Set();
let m;
while ((m = re.exec(js)) && set.size < 100) {
  if (m[1].length < 140) set.add(m[1]);
}
console.log('\nSTRINGS:');
[...set].sort().forEach((s) => console.log(s));
