const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target = `          if (docSnap.exists()) {
            if (docSnap.data().role) updatedRole = docSnap.data().role as UserRole;
            if (docSnap.data().status) updatedStatus = docSnap.data().status as UserStatus;
          }`;

const replacement = `          if (docSnap.exists()) {
            if (docSnap.data().role) updatedRole = docSnap.data().role as UserRole;
            if (docSnap.data().status) updatedStatus = docSnap.data().status as UserStatus;
          }
          
          // Ensure shopkeeper gets their real status from shops collection
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
          }`;

if (code.includes(target) && !code.includes("shopSnap.exists()")) {
    code = code.replace(target, replacement);
    fs.writeFileSync('src/App.tsx', code);
    console.log("App.tsx patched to read shop status directly.");
} else {
    console.log("Already patched or target not found.");
}
