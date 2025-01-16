import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const inputDir = 'public/img';
const outputDir = 'public/img';  // Или public/img, если нужно сохранить в public

async function convertToWebp(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      await convertToWebp(filePath);
    } else if (/\.(png|jpe?g)$/i.test(file)) {
      const relativePath = path.relative(inputDir, filePath);
      const outputPath = path.join(outputDir, relativePath.replace(/\.(png|jpe?g)$/, '.webp'));

      fs.mkdirSync(path.dirname(outputPath), { recursive: true });

      await sharp(filePath)
        .webp({ quality: 75 })
        .toFile(outputPath);

      console.log(`Converted: ${filePath} -> ${outputPath}`);
    }
  }
}

convertToWebp(inputDir);