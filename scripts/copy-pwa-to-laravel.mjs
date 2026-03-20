import fs from 'fs';
import path from 'path';

const src = path.resolve('dist/pwa');
const dest = 'D:/P/SPENDING-TRACKING-BUDGET-APP-LARAVEL/public';

function copyDir(srcDir, destDir) {
  fs.mkdirSync(destDir, { recursive: true });
  for (const file of fs.readdirSync(srcDir)) {
    const srcPath = path.join(srcDir, file);
    const destPath = path.join(destDir, file);
    if (fs.statSync(srcPath).isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

if (!fs.existsSync(src)) {
  console.error(`Source not found: ${src}`);
  process.exit(1);
}

copyDir(src, dest);
console.log(`✓ Copied dist/pwa → ${dest}`);
