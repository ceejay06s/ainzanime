const fs = require('fs');
const path = require('path');

for (const file of ['miruro-watch.js', 'miruro-providers.js']) {
  const js = fs.readFileSync(path.join(process.env.TEMP, file), 'utf8');
  console.log(`\n\n======== ${file} (${js.length}) ========`);
  const patterns = [
    'strm',
    'strmcx',
    'iframe',
    'embed',
    'PLAYER',
    'player',
    'anikoto',
    'icarus',
    'sun',
    'bee',
    'host',
    'postMessage',
    'keeply',
    'm3u8',
    'hls',
    'vidstack',
    'Artplayer',
    'createElement',
    'src=',
    'VITE_',
    'origin',
    'proxy',
    '?ep',
    'server',
  ];
  for (const p of patterns) {
    let idx = 0;
    let count = 0;
    while ((idx = js.toLowerCase().indexOf(p.toLowerCase(), idx)) !== -1 && count < 2) {
      if (count === 0) console.log(`\n## ${p}`);
      console.log(JSON.stringify(js.slice(Math.max(0, idx - 90), idx + 150)));
      idx += p.length;
      count++;
    }
  }

  // Extract import paths / dynamic imports
  const imports = [...js.matchAll(/import\(["'`]([^"'`]+)["'`]\)/g)].map((m) => m[1]);
  console.log('\nDYNAMIC IMPORTS:', [...new Set(imports)].slice(0, 40));

  // String literals of interest
  const re = /["'`](\/?[A-Za-z0-9_./:?&=%-]{3,120})["'`]/g;
  const urls = new Set();
  let m;
  while ((m = re.exec(js)) && urls.size < 80) {
    const s = m[1];
    if (/http|embed|player|strm|watch|api|proxy|host|server|iframe|\.m3u8|anilist/i.test(s)) {
      urls.add(s);
    }
  }
  console.log('\nURL-ISH STRINGS:');
  [...urls].sort().forEach((s) => console.log(s));
}
