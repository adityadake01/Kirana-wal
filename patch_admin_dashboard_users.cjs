const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminDashboard.tsx', 'utf8');

if (!code.includes("import AdminCustomerList")) {
  code = code.replace(
    "import AdminProfile from '../../components/profile/AdminProfile';",
    "import AdminProfile from '../../components/profile/AdminProfile';\nimport AdminCustomerList from './AdminCustomerList';"
  );
  
  const usersContentStr = `            {activeTab === 'users' && (
                <div className="space-y-6">
                   <h3 className="text-xl font-bold text-gray-900">User Management</h3>
                   <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mt-8">
                       <p className="text-gray-500">User management interface will go here.</p>
                   </div>
                </div>
            )}`;
            
  const newUsersContentStr = `            {activeTab === 'users' && (
                <div className="space-y-6">
                   <h3 className="text-xl font-bold text-gray-900">User Management</h3>
                   <AdminCustomerList />
                </div>
            )}`;
            
  if (code.includes(usersContentStr)) {
      code = code.replace(usersContentStr, newUsersContentStr);
      fs.writeFileSync('src/pages/admin/AdminDashboard.tsx', code);
  }
}
