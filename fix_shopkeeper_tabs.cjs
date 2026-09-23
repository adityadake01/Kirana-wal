const fs = require('fs');
let code = fs.readFileSync('src/pages/shopkeeper/ShopkeeperDashboard.tsx', 'utf8');

const originalMenuItems = `  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'myshop', label: 'My Store', icon: Store },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'add-product', label: 'Add Product', icon: Package },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'customers', label: 'Customers', icon: Package },
    { id: 'reviews', label: 'Reviews', icon: Package },
    { id: 'sales', label: 'Sales', icon: IndianRupee },
    { id: 'earnings', label: 'Earnings', icon: IndianRupee },
    { id: 'notifications', label: 'Notifications', icon: Package },
    { id: 'profile', label: 'Profile', icon: Settings },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'support', label: 'Help & Support', icon: Settings },
  ];`;

const newMenuItems = `  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'myshop', label: 'My Store', icon: Store },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'settings', label: 'Settings & Profile', icon: Settings },
  ];`;

if (code.includes('const menuItems = [')) {
    code = code.replace(/const menuItems = \[[^\]]*\];/, newMenuItems);
}

// Remove the placeholder block completely
const placeholderRegex = /{\/\* Placeholder for other tabs to keep UI clean \*\/}[\s\S]*?{\activeTab !== 'dashboard' && activeTab !== 'products' && activeTab !== 'myshop' && activeTab !== 'orders' && activeTab !== 'settings' && \([\s\S]*?<\/div>\n        \)}/;
// Wait, regex might be tricky. Let's just use string replace.
const placeholderStart = "{/* Placeholder for other tabs to keep UI clean */}";
const placeholderEnd = "        )}";
const startIdx = code.indexOf(placeholderStart);
if (startIdx !== -1) {
    let endIdx = code.indexOf(placeholderEnd, startIdx);
    if (endIdx !== -1) {
        // Find the next `)}`
        endIdx = code.indexOf(")}", endIdx) + 2;
        code = code.substring(0, startIdx) + code.substring(endIdx);
    }
}

fs.writeFileSync('src/pages/shopkeeper/ShopkeeperDashboard.tsx', code);
