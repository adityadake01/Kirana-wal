const fs = require('fs');

// ShopPage.tsx
let shopCode = fs.readFileSync('src/pages/ShopPage.tsx', 'utf8');
shopCode = shopCode.replace(/quantity: quantity/g, 'quantity: quantity as number');
fs.writeFileSync('src/pages/ShopPage.tsx', shopCode);

// CustomerDashboard.tsx
let dashCode = fs.readFileSync('src/pages/customer/CustomerDashboard.tsx', 'utf8');
dashCode = dashCode.replace(/data\.sort\(\(a, b\)/, 'data.sort((a: any, b: any)');
fs.writeFileSync('src/pages/customer/CustomerDashboard.tsx', dashCode);

// SellerOrders.tsx
let ordersCode = fs.readFileSync('src/pages/shopkeeper/SellerOrders.tsx', 'utf8');
ordersCode = ordersCode.replace(/data\.sort\(\(a, b\)/, 'data.sort((a: any, b: any)');
fs.writeFileSync('src/pages/shopkeeper/SellerOrders.tsx', ordersCode);

// SellerShop.tsx
let shopSettingsCode = fs.readFileSync('src/pages/shopkeeper/SellerShop.tsx', 'utf8');
if (!shopSettingsCode.includes('import React')) {
  shopSettingsCode = "import React from 'react';\n" + shopSettingsCode;
}
fs.writeFileSync('src/pages/shopkeeper/SellerShop.tsx', shopSettingsCode);

