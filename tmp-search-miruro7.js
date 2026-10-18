const fs = require('fs');
const path = require('path');
const js = fs.readFileSync(path.join(process.env.TEMP, 'miruro-watch.js'), 'utf8');

// Dump large context around proxy URL builders
const markers = ['function Sr', 'function Cr', 'function xr', 'function _r', 'function fr', 'function mr', 'function pr', 'pl.m3u8', '/api/'];
for (const m of markers) {
  const idx = js.indexOf(m);
  console.log(`\n#### ${m} @ ${idx}`);
  if (idx >= 0) console.log(js.slice(idx, idx + 900));
}

// Find how episode sources are fetched - look for query keys / useQuery
const qMarkers = ['queryKey', 'queryFn', 'episodes', 'sources', 'providers', 'useQuery', 'monkey'];
for (const m of qMarkers) {
  let idx = 0;
  let c = 0;
  while ((idx = js.indexOf(m, idx)) !== -1 && c < 2) {
    if (c === 0) console.log(`\n#### hits for ${m}`);
    console.log(JSON.stringify(js.slice(Math.max(0, idx - 50), idx + 200)));
    idx += m.length;
    c++;
  }
}
