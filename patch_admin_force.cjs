const fs = require('fs');
const files = ['src/App.tsx', 'src/pages/Login.tsx', 'src/pages/Register.tsx'];

for (const file of files) {
  let code = fs.readFileSync(file, 'utf8');

  if (file === 'src/App.tsx') {
    if (!code.includes("updateDoc(doc(db, 'users', firebaseUser.uid), { role: 'admin' })")) {
      // Add updateDoc to imports
      code = code.replace(
        "import { doc, onSnapshot } from 'firebase/firestore';",
        "import { doc, onSnapshot, updateDoc } from 'firebase/firestore';"
      );
      
      code = code.replace(
        /if \(firebaseUser\.email\?\.toLowerCase\(\) === 'adityadake627@gmail\.com'\) \{[\s\S]*?setUser\(firebaseUser, 'admin'\);[\s\S]*?setLoading\(false\);/,
        `if (firebaseUser.email?.toLowerCase() === 'adityadake627@gmail.com') {
           setUser(firebaseUser, 'admin');
           setLoading(false);
           updateDoc(doc(db, 'users', firebaseUser.uid), { role: 'admin' }).catch(() => {});`
      );
    }
  }

  if (file === 'src/pages/Register.tsx') {
    code = code.replace(
      /\} else \{[\s\n]*const existingRole = docSnap\.data\(\)\.role;[\s\n]*const existingStatus = docSnap\.data\(\)\.status \|\| 'active';[\s\n]*useAuthStore\.getState\(\)\.setUser\(user, existingRole, existingStatus\);[\s\n]*\}/,
      `} else {
        let existingRole = docSnap.data().role;
        const existingStatus = docSnap.data().status || 'active';
        if (user.email?.toLowerCase() === 'adityadake627@gmail.com') {
           existingRole = 'admin';
           updateDoc(docRef, { role: 'admin' }).catch(() => {});
        }
        useAuthStore.getState().setUser(user, existingRole, existingStatus);
      }`
    );
    // In case updateDoc isn't imported
    if (code.includes('updateDoc(docRef') && !code.includes("updateDoc")) {
      code = code.replace("getDownloadURL } from 'firebase/storage';", "getDownloadURL } from 'firebase/storage';\nimport { updateDoc } from 'firebase/firestore';");
    }
  }

  if (file === 'src/pages/Login.tsx') {
    code = code.replace(
      /if \(!docSnap\.exists\(\)\) \{[\s\S]*?useAuthStore\.getState\(\)\.setUser\(user, assignedRole, 'active'\);\s*\}/,
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
      } else {
        let existingRole = docSnap.data().role;
        const existingStatus = docSnap.data().status || 'active';
        if (user.email?.toLowerCase() === 'adityadake627@gmail.com') {
           existingRole = 'admin';
           updateDoc(docRef, { role: 'admin' }).catch(() => {});
        }
        useAuthStore.getState().setUser(user, existingRole, existingStatus);
      }`
    );
    
    if (code.includes('updateDoc(docRef') && !code.includes("updateDoc,")) {
      code = code.replace("import { doc, getDoc, setDoc } from 'firebase/firestore';", "import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';");
    }
  }

  fs.writeFileSync(file, code);
}
