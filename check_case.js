const fs = require('fs');
const path = require('path');

function checkFileCase(baseDir, importPath) {
    const parts = importPath.split('/');
    let currentPath = baseDir;

    for (let part of parts) {
        if (part === '.' || part === '..') {
            currentPath = Math.resolve ? path.resolve(currentPath, part) : path.join(currentPath, part);
            continue;
        }
        try {
            const files = fs.readdirSync(currentPath);
            let found = files.find(f => f === part || f === part + '.tsx' || f === part + '.ts' || f === part + '.js');
            if (found) {
                currentPath = path.join(currentPath, found);
                continue;
            }
            let asDir = files.find(f => f === part);
            if (asDir) {
                let inside = fs.readdirSync(path.join(currentPath, asDir));
                if (inside.includes('index.tsx') || inside.includes('index.ts') || inside.includes('index.js')) {
                    return true;
                }
            }
            return false;
        } catch (e) {
            return false;
        }
    }
    return true;
}

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        if (file === 'node_modules' || file === '.next') return;
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
            results.push(file);
        }
    });
    return results;
}

const allFiles = walk('src');
let errors = [];

allFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    const regex = /import\s+.*?\s+from\s+['"\`](.*?)['"\`]/g;
    let match;
    while ((match = regex.exec(content)) !== null) {
        const importPath = match[1];
        if (importPath.startsWith('.')) {
            const isValid = checkFileCase(path.dirname(file), importPath);
            if (!isValid) {
                errors.push({ file, importPath });
            }
        } else if (importPath.startsWith('@/')) {
            let actualPath = importPath.replace('@/', './src/');
            const isValid = checkFileCase(process.cwd(), actualPath);
            if (!isValid) {
                errors.push({ file, importPath });
            }
        }
    }
});

if (errors.length) {
    console.log(JSON.stringify(errors, null, 2));
} else {
    console.log('No case errors');
}
