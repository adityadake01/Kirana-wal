const fs = require('fs');
let code = fs.readFileSync('src/store/settingsStore.ts', 'utf8');

code = code.replace(
  /console\.error\("Failed to fetch settings:", err\);\s*set\(\{ loading: false \}\);/,
  `console.error("Failed to fetch settings:", err);\n        initialized = false; // allow retry\n        set({ loading: false });`
);

fs.writeFileSync('src/store/settingsStore.ts', code);
