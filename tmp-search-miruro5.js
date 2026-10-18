const fs = require('fs');
const path = require('path');
const js = fs.readFileSync(path.join(process.env.TEMP, 'miruro-watch.js'), 'utf8');

// Find API base URLs / fetch patterns
const patterns = [
  'fetch(',
  'keeply',
  '/sources',
  '/episodes',
  '/watch/',
  'pipe',
  'decrypt',
  'https://',
  's1.',
  's2.',
  'api.',
  'graphql',
  'providerId',
  'icarus',
  'animepahe',
];

for (const p of patterns) {
  let idx = 0;
  let n = 0;
  console.log(`\n## ${p}`);
  while ((idx = js.indexOf(p, idx)) !== -1 && n < 3) {
    console.log(JSON.stringify(js.slice(Math.max(0, idx - 60), idx + 180)));
    idx += p.length;
    n++;
  }
  if (n === 0) console.log('NONE');
}

// Also dump all https:// strings
const https = [...js.matchAll(/https?:\/\/[^"'`\s)]+/g)].map((m) => m[0]);
console.log('\n## ALL HTTPS');
[...new Set(https)].sort().forEach((s) => console.log(s));
