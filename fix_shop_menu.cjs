const fs = require('fs');
let code = fs.readFileSync('src/pages/shopkeeper/ShopkeeperDashboard.tsx', 'utf8');
code = code.replace("Clock , Menu }", "Clock }");
fs.writeFileSync('src/pages/shopkeeper/ShopkeeperDashboard.tsx', code);
