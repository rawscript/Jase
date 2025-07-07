import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const basePath = process.argv[2] || process.cwd();
const ignoredDirs = new Set(['node_modules', '.git', 'dist']);

function walk(dir, prefix = '') {
  const files = fs.readdirSync(dir);

  files.forEach((file, index) => {
    if (ignoredDirs.has(file)) return;

    const fullPath = path.join(dir, file);
    const stats = fs.statSync(fullPath);
    const isLast = index === files.length - 1;
    const connector = isLast ? '└── ' : '├── ';

    console.log(prefix + connector + file);

    if (stats.isDirectory()) {
      const newPrefix = prefix + (isLast ? '    ' : '│   ');
      walk(fullPath, newPrefix);
    }
  });
}

console.log(`📁 ${path.basename(basePath)}\n`);
walk(basePath);
