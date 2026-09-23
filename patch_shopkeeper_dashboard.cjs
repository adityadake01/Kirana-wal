const fs = require('fs');
let sellerCode = fs.readFileSync('src/pages/shopkeeper/ShopkeeperDashboard.tsx', 'utf8');

const sellerTabs = `
        <div className="p-4 flex-1 overflow-y-auto space-y-1">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 mt-2 px-4">Main</div>
          <button onClick={() => handleTabChange('overview')} className={\`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition \${activeTab === 'overview' ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-gray-600 hover:bg-gray-50'}\`}><LayoutDashboard size={18} /> Dashboard</button>
          <button onClick={() => handleTabChange('mystore')} className={\`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition \${activeTab === 'mystore' ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-gray-600 hover:bg-gray-50'}\`}><Store size={18} /> My Store</button>

          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 mt-6 px-4">Catalog</div>
          <button onClick={() => handleTabChange('products')} className={\`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition \${activeTab === 'products' ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-gray-600 hover:bg-gray-50'}\`}><Tractor size={18} /> Products</button>
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
          <button onClick={() => handleTabChange('support')} className={\`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition \${activeTab === 'support' ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-gray-600 hover:bg-gray-50'}\`}><MessageSquare size={18} /> Support</button>
        </div>
`;

const sStartIdx = sellerCode.indexOf('<div className="p-4 flex-1 overflow-y-auto space-y-2">');
const sEndIdx = sellerCode.indexOf('<div className="p-4 border-t border-gray-100">');
if (sStartIdx !== -1 && sEndIdx !== -1) {
    const oldBlock = sellerCode.substring(sStartIdx, sEndIdx);
    sellerCode = sellerCode.replace(oldBlock, sellerTabs);
    fs.writeFileSync('src/pages/shopkeeper/ShopkeeperDashboard.tsx', sellerCode);
    console.log("ShopkeeperDashboard tabs updated.");
} else {
    console.log("Could not find seller tab block.");
}
