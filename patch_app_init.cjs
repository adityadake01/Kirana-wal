const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/useNotificationStore\.getState\(\)\.init\(\);/g, "useNotificationStore.getState().init();\n          useSettingsStore.getState().init();");

fs.writeFileSync('src/App.tsx', code);
