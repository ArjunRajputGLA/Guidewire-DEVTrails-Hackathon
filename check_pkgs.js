const fs = require('fs');
const path = require('path');
function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        if (file === 'node_modules' || file === '.next') return;
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            results = results.concat(walk(fullPath));
        } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js')) {
            results.push(fullPath);
        }
    });
    return results;
}
let files = walk('src');
let pkgs = new Set();
files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  const matches = content.matchAll(/from\s+['"]([^./\\][^'"]*)['"]/g);
  for(let m of Object.keys(matches)) {
      // Just a simple regex logic
  }
  const regex = /import\s+.*?\s+from\s+['"]([^./\\][^'"]*)['"]/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
      let pkg = match[1].split('/')[0];
      if (pkg.startsWith('@')) pkg += '/' + match[1].split('/')[1];
      pkgs.add(pkg);
  }
});
console.log(Array.from(pkgs));
