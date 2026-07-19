const fs = require('fs');
const path = require('path');

const root = process.cwd();
const fixed = [];
const ok = [];

function walk(dir) {
  let entries;
  try {
    entries = fs.readdirSync(dir);
  } catch (e) {
    return;
  }
  for (const name of entries) {
    const p = path.join(dir, name);
    let stat;
    try {
      stat = fs.statSync(p);
    } catch (e) {
      continue;
    }
    if (stat.isDirectory()) {
      walk(p);
    } else if (name === '.gitkeep') {
      let content = '';
      try {
        content = fs.readFileSync(p, 'utf8');
      } catch (e) {}
      if (content && content.trim().length > 0) {
        try {
          fs.writeFileSync(p, '', 'utf8');
          fixed.push(p);
        } catch (e) {}
      } else {
        ok.push(p);
      }
    }
  }
}

walk(root);

ok.forEach(p => console.log('OK:' + p));
fixed.forEach(p => console.log('FIXED:' + p));
console.log('SUMMARY: OK=' + ok.length + ' FIXED=' + fixed.length);