const fs = require('fs');

// --- 1. PATCH ADMIN DASHBOARD ---
let adminCode = fs.readFileSync('src/pages/admin/AdminDashboard.tsx', 'utf8');

const adminTabs = `
        <div className="p-4 flex-1 overflow-y-auto space-y-1">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 mt-4 px-4">Main</div>
          <button onClick={() => handleTabChange('overview')} className={\`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition \${activeTab === 'overview' ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-gray-600 hover:bg-gray-50'}\`}><LayoutDashboard size={18} /> Dashboard</button>
          <button onClick={() => handleTabChange('orders')} className={\`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition \${activeTab === 'orders' ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-gray-600 hover:bg-gray-50'}\`}><FileText size={18} /> Orders</button>
          
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 mt-6 px-4">Users</div>
          <button onClick={() => handleTabChange('users')} className={\`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition \${activeTab === 'users' ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-gray-600 hover:bg-gray-50'}\`}><Users size={18} /> Customers</button>
          <button onClick={() => handleTabChange('sellers')} className={\`w-full flex items-center justify-between px-4 py-2.5 rounded-xl transition \${activeTab === 'sellers' ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-gray-600 hover:bg-gray-50'}\`}>
             <div className="flex items-center gap-3"><Store size={18} /> Sellers</div>
             {pendingSellers.length > 0 && <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{pendingSellers.length}</span>}
          </button>
          
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 mt-6 px-4">Catalog</div>
          <button onClick={() => handleTabChange('products')} className={\`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition \${activeTab === 'products' ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-gray-600 hover:bg-gray-50'}\`}><Tractor size={18} /> Products</button>
          <button onClick={() => handleTabChange('categories')} className={\`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition \${activeTab === 'categories' ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-gray-600 hover:bg-gray-50'}\`}><LayoutDashboard size={18} /> Categories</button>
          <button onClick={() => handleTabChange('inventory')} className={\`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition \${activeTab === 'inventory' ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-gray-600 hover:bg-gray-50'}\`}><CheckCircle2 size={18} /> Inventory</button>

          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 mt-6 px-4">Finance</div>
          <button onClick={() => handleTabChange('payments')} className={\`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition \${activeTab === 'payments' ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-gray-600 hover:bg-gray-50'}\`}><DollarSign size={18} /> Payments</button>
          <button onClick={() => handleTabChange('commissions')} className={\`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition \${activeTab === 'commissions' ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-gray-600 hover:bg-gray-50'}\`}><FileText size={18} /> Commissions</button>
          <button onClick={() => handleTabChange('payouts')} className={\`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition \${activeTab === 'payouts' ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-gray-600 hover:bg-gray-50'}\`}><DollarSign size={18} /> Payouts</button>

          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 mt-6 px-4">Marketing & Support</div>
          <button onClick={() => handleTabChange('reviews')} className={\`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition \${activeTab === 'reviews' ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-gray-600 hover:bg-gray-50'}\`}><MessageSquare size={18} /> Reviews</button>
          <button onClick={() => handleTabChange('coupons')} className={\`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition \${activeTab === 'coupons' ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-gray-600 hover:bg-gray-50'}\`}><CheckCircle2 size={18} /> Coupons</button>
          <button onClick={() => handleTabChange('offers')} className={\`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition \${activeTab === 'offers' ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-gray-600 hover:bg-gray-50'}\`}><CheckCircle2 size={18} /> Offers</button>
          <button onClick={() => handleTabChange('banners')} className={\`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition \${activeTab === 'banners' ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-gray-600 hover:bg-gray-50'}\`}><CheckCircle2 size={18} /> Banners</button>
          <button onClick={() => handleTabChange('notifications')} className={\`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition \${activeTab === 'notifications' ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-gray-600 hover:bg-gray-50'}\`}><CheckCircle2 size={18} /> Notifications</button>
          <button onClick={() => handleTabChange('reports')} className={\`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition \${activeTab === 'reports' ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-gray-600 hover:bg-gray-50'}\`}><CheckCircle2 size={18} /> Reports</button>
          <button onClick={() => handleTabChange('support')} className={\`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition \${activeTab === 'support' ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-gray-600 hover:bg-gray-50'}\`}><CheckCircle2 size={18} /> Support</button>
          
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 mt-6 px-4">System</div>
          <button onClick={() => handleTabChange('auditlogs')} className={\`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition \${activeTab === 'auditlogs' ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-gray-600 hover:bg-gray-50'}\`}><CheckCircle2 size={18} /> Audit Logs</button>
          <button onClick={() => handleTabChange('settings')} className={\`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition \${activeTab === 'settings' ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-gray-600 hover:bg-gray-50'}\`}><Settings size={18} /> Settings</button>
          <button onClick={() => handleTabChange('profile')} className={\`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition \${activeTab === 'profile' ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-gray-600 hover:bg-gray-50'}\`}><User size={18} /> Profile</button>
        </div>
`;

// Find the block from <div className="p-4 flex-1 overflow-y-auto space-y-2"> to </div> right before <div className="p-4 border-t border-gray-100">
const startIdx = adminCode.indexOf('<div className="p-4 flex-1 overflow-y-auto space-y-2">');
const endIdx = adminCode.indexOf('<div className="p-4 border-t border-gray-100">');
if (startIdx !== -1 && endIdx !== -1) {
    const oldBlock = adminCode.substring(startIdx, endIdx);
    adminCode = adminCode.replace(oldBlock, adminTabs);
    fs.writeFileSync('src/pages/admin/AdminDashboard.tsx', adminCode);
    console.log("AdminDashboard tabs updated.");
} else {
    console.log("Could not find admin tab block.");
}

// --- 2. PATCH SHOPKEEPER DASHBOARD ---
let sellerCode = fs.readFileSync('src/pages/ShopkeeperDashboard.tsx', 'utf8');

const sellerTabs = `
        <div className="p-4 flex-1 overflow-y-auto space-y-1">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 mt-2 px-4">Main</div>
          <button onClick={() => handleTabChange('overview')} className={\`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition \${activeTab === 'overview' ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-gray-600 hover:bg-gray-50'}\`}><LayoutDashboard size={18} /> Dashboard</button>
          <button onClick={() => handleTabChange('mystore')} className={\`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition \${activeTab === 'mystore' ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-gray-600 hover:bg-gray-50'}\`}><Store size={18} /> My Store</button>

          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 mt-6 px-4">Catalog</div>
          <button onClick={() => handleTabChange('products')} className={\`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition \${activeTab === 'products' ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-gray-600 hover:bg-gray-50'}\`}><Tractor size={18} /> Products</button>
          <button onClick={() => handleTabChange('addproduct')} className={\`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition \${activeTab === 'addproduct' ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-gray-600 hover:bg-gray-50'}\`}><Tractor size={18} /> Add Product</button>
          <button onClick={() => handleTabChange('inventory')} className={\`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition \${activeTab === 'inventory' ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-gray-600 hover:bg-gray-50'}\`}><CheckCircle2 size={18} /> Inventory</button>

          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 mt-6 px-4">Sales</div>
          <button onClick={() => handleTabChange('orders')} className={\`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition \${activeTab === 'orders' ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-gray-600 hover:bg-gray-50'}\`}><FileText size={18} /> Orders</button>
          <button onClick={() => handleTabChange('customers')} className={\`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition \${activeTab === 'customers' ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-gray-600 hover:bg-gray-50'}\`}><Users size={18} /> Customers</button>
          <button onClick={() => handleTabChange('reviews')} className={\`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition \${activeTab === 'reviews' ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-gray-600 hover:bg-gray-50'}\`}><MessageSquare size={18} /> Reviews</button>

          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 mt-6 px-4">Finance</div>
          <button onClick={() => handleTabChange('sales')} className={\`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition \${activeTab === 'sales' ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-gray-600 hover:bg-gray-50'}\`}><DollarSign size={18} /> Sales</button>
          <button onClick={() => handleTabChange('earnings')} className={\`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition \${activeTab === 'earnings' ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-gray-600 hover:bg-gray-50'}\`}><DollarSign size={18} /> Earnings</button>

          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 mt-6 px-4">Account</div>
          <button onClick={() => handleTabChange('notifications')} className={\`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition \${activeTab === 'notifications' ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-gray-600 hover:bg-gray-50'}\`}><CheckCircle2 size={18} /> Notifications</button>
          <button onClick={() => handleTabChange('profile')} className={\`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition \${activeTab === 'profile' ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-gray-600 hover:bg-gray-50'}\`}><User size={18} /> Profile</button>
          <button onClick={() => handleTabChange('settings')} className={\`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition \${activeTab === 'settings' ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-gray-600 hover:bg-gray-50'}\`}><Settings size={18} /> Settings</button>
          <button onClick={() => handleTabChange('support')} className={\`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition \${activeTab === 'support' ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-gray-600 hover:bg-gray-50'}\`}><MessageSquare size={18} /> Help & Support</button>
        </div>
`;

const sStartIdx = sellerCode.indexOf('<div className="p-4 flex-1 overflow-y-auto space-y-2">');
const sEndIdx = sellerCode.indexOf('<div className="p-4 border-t border-gray-100">');
if (sStartIdx !== -1 && sEndIdx !== -1) {
    const oldBlock = sellerCode.substring(sStartIdx, sEndIdx);
    sellerCode = sellerCode.replace(oldBlock, sellerTabs);
    fs.writeFileSync('src/pages/ShopkeeperDashboard.tsx', sellerCode);
    console.log("ShopkeeperDashboard tabs updated.");
} else {
    console.log("Could not find seller tab block.");
}
