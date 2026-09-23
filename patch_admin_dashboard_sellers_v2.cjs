const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminDashboard.tsx', 'utf8');

if (!code.includes("import AdminSellerList")) {
  code = code.replace(
    "import AdminCustomerList from './AdminCustomerList';",
    "import AdminCustomerList from './AdminCustomerList';\nimport AdminSellerList from './AdminSellerList';"
  );
  
  const blockStart = "{activeTab === 'sellers' && (";
  const blockEnd = "{activeTab === 'users' && (";
  
  const startIndex = code.indexOf(blockStart);
  const endIndex = code.indexOf(blockEnd);
  
  if (startIndex !== -1 && endIndex !== -1) {
    const originalBlock = code.substring(startIndex, endIndex);
    const newBlock = `{activeTab === 'sellers' && (
                <AdminSellerList />
            )}
            
            `;
    code = code.replace(originalBlock, newBlock);
    fs.writeFileSync('src/pages/admin/AdminDashboard.tsx', code);
    console.log("Patched successfully");
  } else {
    console.log("Could not find blocks");
  }
}
