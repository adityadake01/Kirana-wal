const fs = require('fs');
let code = fs.readFileSync('src/pages/shopkeeper/SellerOrders.tsx', 'utf8');

if (!code.includes("addDoc(collection(db, 'notifications')")) {
  code = code.replace("import { collection, query, where, onSnapshot, doc, updateDoc, orderBy } from 'firebase/firestore';", 
    "import { collection, query, where, onSnapshot, doc, updateDoc, addDoc } from 'firebase/firestore';");
}

code = code.replace(
  /const updateOrderStatus = async \(orderId: string, status: string\) => \{[\s\S]*?try \{[\s\S]*?await updateDoc\(doc\(db, 'orders', orderId\), \{[\s\S]*?status,[\s\S]*?updatedAt: new Date\(\)\.toISOString\(\)[\s\S]*?\}\);/,
  `const updateOrderStatus = async (orderId: string, status: string, customerId: string) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status,
        updatedAt: new Date().toISOString()
      });
      
      if (customerId) {
        await addDoc(collection(db, 'notifications'), {
          recipientId: customerId,
          title: 'Order Status Updated',
          message: \`Your order #\${orderId.slice(-6).toUpperCase()} is now \${status}.\`,
          read: false,
          createdAt: new Date().toISOString(),
          actionUrl: '/dashboard'
        });
      }`
);

// We need to update the button calls to include customerId
code = code.replace(/updateOrderStatus\(order\.id, 'Accepted'\)/g, "updateOrderStatus(order.id, 'Accepted', order.customerId)");
code = code.replace(/updateOrderStatus\(order\.id, 'Cancelled'\)/g, "updateOrderStatus(order.id, 'Cancelled', order.customerId)");
code = code.replace(/updateOrderStatus\(order\.id, 'Preparing'\)/g, "updateOrderStatus(order.id, 'Preparing', order.customerId)");
code = code.replace(/updateOrderStatus\(order\.id, 'Ready'\)/g, "updateOrderStatus(order.id, 'Ready', order.customerId)");
code = code.replace(/updateOrderStatus\(order\.id, 'Dispatched'\)/g, "updateOrderStatus(order.id, 'Dispatched', order.customerId)");
code = code.replace(/updateOrderStatus\(order\.id, 'Delivered'\)/g, "updateOrderStatus(order.id, 'Delivered', order.customerId)");

fs.writeFileSync('src/pages/shopkeeper/SellerOrders.tsx', code);
