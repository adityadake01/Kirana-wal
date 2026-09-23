const fs = require('fs');
let code = fs.readFileSync('src/store/notificationStore.ts', 'utf8');
code = code.replace(/console\.error\("Notifications err:", err\);/g, 'console.warn("Notifications err:", err);');
fs.writeFileSync('src/store/notificationStore.ts', code);
