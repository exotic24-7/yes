const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ignoreDirs = new Set(['extensions','build','beacon.min.js','node_modules','gfx','live-server-lite','webpack','.git']);
const root = process.cwd();
let errors = [];

function walk(dir){
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for(const e of entries){
    const full = path.join(dir, e.name);
    if(e.isDirectory()){
      if(ignoreDirs.has(e.name)) continue;
      walk(full);
    } else if(e.isFile() && full.endsWith('.js')){
      // skip this checker file
      if(path.basename(full) === 'check_syntax.js') continue;
      try{
        const code = fs.readFileSync(full, 'utf8');
        // Try to compile the script to detect syntax errors
        new vm.Script(code, { filename: full });
      } catch(err){
        errors.push({ file: full, error: err.message });
      }
    }
  }
}

walk(root);

if(errors.length === 0){
  console.log('OK: no syntax errors found in scanned .js files');
  process.exit(0);
} else {
  console.log('SYNTAX ERRORS FOUND:');
  for(const e of errors){
    console.log(e.file);
    console.log('  ', e.error);
  }
  process.exit(2);
}
