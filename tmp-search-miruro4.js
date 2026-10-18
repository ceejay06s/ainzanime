const fs = require('fs');
const path = require('path');
const js = fs.readFileSync(path.join(process.env.TEMP, 'miruro-watch.js'), 'utf8');

// Find strmcx-embed loading and usage context
const markers = [
  'strmcx-embed',
  'VITE_PLAYER_ORIGIN',
  'setSession',
  'Br(',
  'Jr',
  'function Ur',
  'function Wr',
  'isEmbed',
  'option.embed',
  'n.embed',
  'Kt(',
  'function Kt',
];

for (const marker of markers) {
  const idx = js.indexOf(marker);
  if (idx === -1) {
    console.log(`\n## ${marker}: NOT FOUND`);
    continue;
  }
  console.log(`\n## ${marker} @ ${idx}`);
  console.log(js.slice(Math.max(0, idx - 400), idx + 700));
  console.log('\n----');
}
