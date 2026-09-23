const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminDashboard.tsx', 'utf8');

const fallbackStr = `            {activeTab !== 'overview' && activeTab !== 'sellers' && (
                <div className="flex items-center justify-center h-full min-h-[400px]">
                   <div className="text-center text-gray-400">
                      <LayoutDashboard size={48} className="mx-auto mb-4 opacity-20" />
                      <h2 className="text-xl font-medium">{activeTab} Panel Content goes here</h2>
                      <p className="text-sm mt-2">Architecture is ready for future expansion.</p>
                   </div>
                </div>
            )}`;
            
const newFallbackStr = `            {activeTab === 'users' && (
                <div className="space-y-6">
                   <h3 className="text-xl font-bold text-gray-900">Customer Management</h3>
                   <AdminCustomerList />
                </div>
            )}
            
            {activeTab !== 'overview' && activeTab !== 'sellers' && activeTab !== 'users' && activeTab !== 'settings' && activeTab !== 'profile' && (
                <div className="flex items-center justify-center h-full min-h-[400px]">
                   <div className="text-center text-gray-400">
                      <LayoutDashboard size={48} className="mx-auto mb-4 opacity-20" />
                      <h2 className="text-xl font-medium">{activeTab} Panel Content goes here</h2>
                      <p className="text-sm mt-2">Architecture is ready for future expansion.</p>
                   </div>
                </div>
            )}`;
            
if (code.includes(fallbackStr)) {
  code = code.replace(fallbackStr, newFallbackStr);
  fs.writeFileSync('src/pages/admin/AdminDashboard.tsx', code);
} else {
  console.log("Did not find fallback string");
}
