const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = process.argv[2] || process.cwd();
const skipDirs = new Set(['node_modules', '.git', 'build', 'extensions', 'gfx', 'live-server-lite', 'webpack']);
const files = [];
function walk(dir){
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch(e){ return; }
  for(const e of entries){
    if(skipDirs.has(e.name)) continue;
    const p = path.join(dir, e.name);
    if(e.isDirectory()) walk(p);
    else if(e.isFile() && p.endsWith('.js')) files.push(p);
  }
}
walk(root);

const errs = [];
for(const f of files){
  try{
    const src = fs.readFileSync(f,'utf8');
    new vm.Script(src, { filename: f });
  }catch(err){
    errs.push({ file: f, error: err && err.message ? err.message : String(err) });
  }
}
if(errs.length===0){
  console.log('ALL_OK');
  process.exit(0);
}
for(const e of errs) console.log(e.file + ' : ' + e.error);
process.exit(1);
