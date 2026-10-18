const fs = require('fs');
const path = require('path');
const js = fs.readFileSync(path.join(process.env.TEMP, 'miruro-index.js'), 'utf8');

const patterns = [
  'strmcx',
  'strm.cx',
  'STRM',
  'customElements',
  'ShadowRoot',
  'watchOrInfo',
  '?ep=',
  'provider',
  'servers',
  'Server',
  'Sun',
  'Bee',
  'Icarus',
  'Anikoto',
  'audioType',
  'category',
  'source',
  'm3u8',
  'hls',
  'VideoPlayer',
  'Artplayer',
  'vidstack',
  'media-player',
  'plyr',
  'jwplayer',
];

for (const p of patterns) {
  let idx = 0;
  let count = 0;
  const hits = [];
  while ((idx = js.indexOf(p, idx)) !== -1 && count < 4) {
    hits.push(js.slice(Math.max(0, idx - 100), idx + 160));
    idx += p.length;
    count++;
  }
  console.log(`\n## ${p} (${count})`);
  hits.forEach((h, i) => console.log(`[${i}]`, JSON.stringify(h)));
}

// Find the path builder function around ?ep=
const epIdx = js.indexOf('?ep=');
console.log('\n## CONTEXT AROUND ?ep=');
console.log(js.slice(epIdx - 800, epIdx + 400));
