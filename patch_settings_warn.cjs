const fs = require('fs');
let code = fs.readFileSync('src/store/settingsStore.ts', 'utf8');
code = code.replace(/console\.error\("Failed to fetch settings:", err\);/g, 'console.warn("Failed to fetch settings:", err);');
fs.writeFileSync('src/store/settingsStore.ts', code);
