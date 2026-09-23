const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminDashboard.tsx', 'utf8');

const sidebarStart = '<div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 mt-4 px-4">Main</div>';
const sidebarEnd = '<div className="p-4 border-t border-gray-100">';

const newSidebar = `<div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 mt-4 px-4">Main</div>
          <button onClick={() => handleTabChange('overview')} className={\`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition \${activeTab === 'overview' ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-gray-600 hover:bg-gray-50'}\`}><LayoutDashboard size={18} /> Dashboard</button>
          
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 mt-6 px-4">Users</div>
          <button onClick={() => handleTabChange('users')} className={\`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition \${activeTab === 'users' ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-gray-600 hover:bg-gray-50'}\`}><Users size={18} /> Customers</button>
          <button onClick={() => handleTabChange('sellers')} className={\`w-full flex items-center justify-between px-4 py-2.5 rounded-xl transition \${activeTab === 'sellers' ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-gray-600 hover:bg-gray-50'}\`}>
             <div className="flex items-center gap-3"><Store size={18} /> Sellers</div>
             {pendingSellers.length > 0 && <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{pendingSellers.length}</span>}
          </button>
          
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 mt-6 px-4">System</div>
          <button onClick={() => handleTabChange('settings')} className={\`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition \${activeTab === 'settings' ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-gray-600 hover:bg-gray-50'}\`}><Settings size={18} /> Settings</button>
          <button onClick={() => handleTabChange('profile')} className={\`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition \${activeTab === 'profile' ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-gray-600 hover:bg-gray-50'}\`}><User size={18} /> Profile</button>
        </div>
        `;
        
const s1 = code.indexOf(sidebarStart);
const s2 = code.indexOf(sidebarEnd);
if (s1 !== -1 && s2 !== -1) {
    code = code.substring(0, s1) + newSidebar + code.substring(s2);
}

// Remove the placeholder block
const phStart = "{/* Placeholder for unhandled tabs */}";
const p1 = code.indexOf(phStart);
if (p1 !== -1) {
    const p2 = code.indexOf(")}", p1);
    if (p2 !== -1) {
        code = code.substring(0, p1) + code.substring(p2 + 2);
    }
}

fs.writeFileSync('src/pages/admin/AdminDashboard.tsx', code);
