// fix-imports.js
const fs = require('fs');
const path = require('path');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  // Replace all .js" and .js' with .ts" and .ts'
  content = content.replace(/\.js(["'])/g, '$1');
  fs.writeFileSync(filePath, content);
}

function processDirectory(directory) {
  const files = fs.readdirSync(directory);

  files.forEach(file => {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.ts')) {
      processFile(fullPath);
    }
  });
}

processDirectory('./src/lex-api');
console.log('Finished fixing imports');