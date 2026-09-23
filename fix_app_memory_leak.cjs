const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// First replace the old patch
code = code.replace(`          // Ensure shopkeeper gets their real status from shops collection
          if (updatedRole === 'shopkeeper') {
            onSnapshot(doc(db, 'shops', firebaseUser.uid), (shopSnap) => {
               if (shopSnap.exists() && shopSnap.data().status) {
                  setUser(firebaseUser, updatedRole, shopSnap.data().status);
               } else {
                  setUser(firebaseUser, updatedRole, updatedStatus);
               }
            });
            setLoading(false);
            return;
          }`, `          // Ensure shopkeeper gets their real status from shops collection
          if (updatedRole === 'shopkeeper') {
            if (window.shopUnsubscribe) { window.shopUnsubscribe(); }
            window.shopUnsubscribe = onSnapshot(doc(db, 'shops', firebaseUser.uid), (shopSnap) => {
               if (shopSnap.exists() && shopSnap.data().status) {
                  setUser(firebaseUser, updatedRole, shopSnap.data().status);
               } else {
                  setUser(firebaseUser, updatedRole, updatedStatus);
               }
            });
            setLoading(false);
            return;
          }`);

// Also fix the cleanup
code = code.replace(`    return () => {
      authUnsubscribe();
      if (userUnsubscribe) {
        userUnsubscribe();
      }
    };`, `    return () => {
      authUnsubscribe();
      if (userUnsubscribe) {
        userUnsubscribe();
      }
      if (window.shopUnsubscribe) {
        window.shopUnsubscribe();
      }
    };`);
    
// Add type to window if using TS, but this is a JSX file so we should just do (window as any)
code = code.replace(/window\.shopUnsubscribe/g, '(window as any).shopUnsubscribe');

fs.writeFileSync('src/App.tsx', code);
console.log("Memory leak fixed.");
