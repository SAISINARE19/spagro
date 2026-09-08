import fs from 'node:fs';
import path from 'node:path';

const sourceDir = 'C:/Users/megan/Downloads/SPAGRo';
const destDir = 'C:/Users/megan/OneDrive/Documents/SPAGRO/public/images';

const files = [
  { src: 'unnamed.webp', dest: 'gallery-1.webp' },
  { src: 'unnamed (1).webp', dest: 'gallery-2.webp' },
  { src: 'unnamed (2).webp', dest: 'gallery-3.webp' },
  { src: 'unnamed (3).webp', dest: 'gallery-4.webp' },
  { src: 'unnamed (4).webp', dest: 'gallery-5.webp' },
  { src: 'unnamed (5).webp', dest: 'gallery-6.webp' },
];

fs.mkdirSync(destDir, { recursive: true });

for (const file of files) {
  const sourcePath = path.join(sourceDir, file.src);
  const targetPath = path.join(destDir, file.dest);
  if (fs.existsSync(sourcePath)) {
    fs.copyFileSync(sourcePath, targetPath);
    console.log(`copied ${file.src} -> ${file.dest}`);
  } else {
    console.log(`missing ${sourcePath}`);
  }
}

console.log('gallery folder contents:');
for (const name of fs.readdirSync(destDir)) {
  console.log(name);
}
