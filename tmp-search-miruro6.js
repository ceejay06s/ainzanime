const fs = require('fs');
const path = require('path');

// Search main index bundle for API / keeply / sources endpoints
const js = fs.readFileSync(path.join(process.env.TEMP, 'miruro-index.js'), 'utf8');
const watch = fs.readFileSync(path.join(process.env.TEMP, 'miruro-watch.js'), 'utf8');

for (const [name, src] of [
  ['index', js],
  ['watch', watch],
]) {
  console.log(`\n======== ${name} ========`);
  const https = [...src.matchAll(/["'`]([^"'`]*(?:keeply|proxy|sources|episodes|watch\/|pipe|api\/|s1\.|s2\.)[^"'`]*)["'`]/gi)].map(
    (m) => m[1]
  );
  [...new Set(https)].slice(0, 60).forEach((s) => console.log(s));

  // Find U(`VITE_`) usages nearby
  let idx = 0;
  let c = 0;
  while ((idx = src.indexOf('VITE_PROXY', idx)) !== -1 && c < 5) {
    console.log('CTX', JSON.stringify(src.slice(idx - 100, idx + 300)));
    idx += 10;
    c++;
  }
}
