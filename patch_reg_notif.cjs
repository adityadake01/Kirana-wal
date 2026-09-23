const fs = require('fs');
let code = fs.readFileSync('src/pages/Register.tsx', 'utf8');

if (!code.includes("collection(db, 'notifications')")) {
  code = code.replace("import { doc, setDoc, getDoc } from 'firebase/firestore';", 
    "import { doc, setDoc, getDoc, collection, addDoc } from 'firebase/firestore';");
}

code = code.replace(
  /setDoc\(doc\(db, 'shops', user\.uid\), \{[\s\S]*?\}\)/,
  `setDoc(doc(db, 'shops', user.uid), {
            ownerId: user.uid,
            ownerName: name,
            name: shopName,
            image: shopImage,
            address: fullAddress,
            phone,
            status: 'pending',
            createdAt: new Date().toISOString(),
          })`
); // just a refresh

code = code.replace(
  /await Promise\.all\(promises\);/,
  `await Promise.all(promises);
      
      if (role === 'shopkeeper') {
        await addDoc(collection(db, 'notifications'), {
          recipientId: 'admin',
          title: 'New Seller Registration',
          message: \`\${shopName} has registered and is pending approval.\`,
          read: false,
          createdAt: new Date().toISOString(),
          actionUrl: '/admin?tab=sellers'
        });
      }`
);

fs.writeFileSync('src/pages/Register.tsx', code);
