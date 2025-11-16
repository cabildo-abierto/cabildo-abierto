// fix-imports.mjs
import fs from 'fs/promises';
import path from 'path';
import { glob } from 'glob';

const importRegex = /(from\s+['"](\.\.?\/[^'"]+))['"]/g;

async function processFile(filePath) {
  const content = await fs.readFile(filePath, 'utf8');
  let originalContent = content;

  const newContent = content.replace(importRegex, (match, importStatement, relativePath) => {
    if (path.extname(relativePath) === '') {
      return `${importStatement}.js'`;
    }
    return match;
  });

  if (newContent !== originalContent) {
    await fs.writeFile(filePath, newContent, 'utf8');
    console.log(`Patched: ${filePath}`);
  }
}

async function main() {
  console.log('Fixing generated import paths and adding .js extensions...');

  const files = await glob(['./src/lex-api/**/*.ts', './src/lex-server/**/*.ts'], {
    // Important: This flag helps glob handle paths correctly on Windows
    windowsPathsNoEscape: true,
  });

  if (files.length === 0) {
    console.warn('Warning: No TypeScript files found to patch.');
    return;
  }

  await Promise.all(files.map(processFile));

  console.log('✅ Finished fixing imports.');
}

main().catch(error => {
  console.error('An error occurred while fixing imports:', error);
  process.exit(1);
});