const fs = require('fs');
let code = fs.readFileSync('src/pages/Login.tsx', 'utf8');

if (code.includes("role: 'customer'")) {
  code = code.replace(
    /if \(!docSnap\.exists\(\)\) \{[\s\S]*?const userData = \{[\s\S]*?useAuthStore\.getState\(\)\.setUser\(user, 'customer', 'active'\);\s*\}/,
    `if (!docSnap.exists()) {
        const isAdmin = user.email?.toLowerCase() === 'adityadake627@gmail.com';
        const assignedRole = isAdmin ? 'admin' : 'customer';
        
        const userData = {
          name: user.displayName || (isAdmin ? 'Admin User' : 'Google User'),
          email: user.email,
          phone: user.phoneNumber || '',
          address: '',
          role: assignedRole,
          status: 'active',
          createdAt: new Date().toISOString(),
        };
        await setDoc(docRef, userData);
        useAuthStore.getState().setUser(user, assignedRole, 'active');
      }`
  );
}

fs.writeFileSync('src/pages/Login.tsx', code);
