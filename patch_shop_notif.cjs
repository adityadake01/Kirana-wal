const fs = require('fs');
let code = fs.readFileSync('src/pages/ShopPage.tsx', 'utf8');

if (!code.includes("addDoc(collection(db, 'notifications')")) {
  code = code.replace(
    /await addDoc\(collection\(db, 'orders'\), orderData\);/,
    `const orderRef = await addDoc(collection(db, 'orders'), orderData);
      
      await addDoc(collection(db, 'notifications'), {
        recipientId: shopId,
        title: 'New Order Received!',
        message: \`You received a new order for ₹\${totalAmount} from \${user.displayName || 'a customer'}.\`,
        read: false,
        createdAt: new Date().toISOString(),
        actionUrl: '/shopkeeper?tab=orders'
      });`
  );
}

fs.writeFileSync('src/pages/ShopPage.tsx', code);
