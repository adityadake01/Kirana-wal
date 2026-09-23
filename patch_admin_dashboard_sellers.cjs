const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminDashboard.tsx', 'utf8');

if (!code.includes("import AdminSellerList")) {
  code = code.replace(
    "import AdminCustomerList from './AdminCustomerList';",
    "import AdminCustomerList from './AdminCustomerList';\nimport AdminSellerList from './AdminSellerList';"
  );
  
  // Remove the useEffect for pending sellers since it's now in AdminSellerList
  // But actually we need it for the badge count.
  // Wait, the badge count uses pendingSellers.length, so let's keep it in AdminDashboard for the badge.
  // We just need to replace the content of activeTab === 'sellers'
  
  const contentStrStart = `{activeTab === 'sellers' && (
                <div className="space-y-6">
                   <h3 className="text-xl font-bold text-gray-900">Seller Management</h3>`;
                   
  // Using a regex to replace everything between {activeTab === 'sellers' && ( ... )}
  // This is a bit tricky, let's just do a string replacement for the block.
}
