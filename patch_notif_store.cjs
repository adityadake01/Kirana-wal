const fs = require('fs');
let code = fs.readFileSync('src/store/notificationStore.ts', 'utf8');

code = code.replace("const q = query(\n        collection(db, 'notifications'),\n        where('recipientId', '==', user.uid)\n      );", 
  `const q = role === 'admin' 
        ? query(collection(db, 'notifications'), where('recipientId', 'in', [user.uid, 'admin']))
        : query(collection(db, 'notifications'), where('recipientId', '==', user.uid));`);

fs.writeFileSync('src/store/notificationStore.ts', code);
