const fs = require('fs');
const path = require('path');
const js = fs.readFileSync(path.join(process.env.TEMP, 'strmcx-client.js'), 'utf8');

const markers = ['/v1/embeds', 'setSession', 'embed`, `1', 'function Ae', 'POST', 'sessionId', 'videoUrl', 'source'];
for (const m of markers) {
  let idx = 0;
  let c = 0;
  while ((idx = js.indexOf(m, idx)) !== -1 && c < 3) {
    console.log(`\n## ${m} @ ${idx}`);
    console.log(js.slice(Math.max(0, idx - 200), idx + 500));
    idx += m.length;
    c++;
  }
}
