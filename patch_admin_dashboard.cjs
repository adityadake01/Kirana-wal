const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminDashboard.tsx', 'utf8');

if (!code.includes("import AdminProfile")) {
  code = code.replace(
    "import AdminSettings from './AdminSettings';",
    "import AdminSettings from './AdminSettings';\nimport AdminProfile from '../../components/profile/AdminProfile';"
  );
  
  // Add icon
  code = code.replace(
    "DollarSign,",
    "DollarSign, User,"
  );
  
  // Add menu item
  const menuStr = `            <button
              onClick={() => setActiveTab('settings')}
              className={\`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition \${activeTab === 'settings' ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-gray-600 hover:bg-gray-50'}\`}
            >
              <Settings className="h-5 w-5" />
              Settings
            </button>`;
            
  const newMenuStr = `            <button
              onClick={() => setActiveTab('settings')}
              className={\`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition \${activeTab === 'settings' ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-gray-600 hover:bg-gray-50'}\`}
            >
              <Settings className="h-5 w-5" />
              Settings
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={\`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition \${activeTab === 'profile' ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-gray-600 hover:bg-gray-50'}\`}
            >
              <User className="h-5 w-5" />
              My Profile
            </button>`;
            
  code = code.replace(menuStr, newMenuStr);
  
  // Add content
  const settingsContentStr = `            {activeTab === 'settings' && (
              <AdminSettings />
            )}`;
            
  const newSettingsContentStr = `            {activeTab === 'settings' && (
              <AdminSettings />
            )}
            
            {activeTab === 'profile' && (
              <AdminProfile />
            )}`;
            
  code = code.replace(settingsContentStr, newSettingsContentStr);
  
  // Update fallback
  code = code.replace(
    "activeTab !== 'overview' && activeTab !== 'sellers' && activeTab !== 'users' && activeTab !== 'settings'",
    "activeTab !== 'overview' && activeTab !== 'sellers' && activeTab !== 'users' && activeTab !== 'settings' && activeTab !== 'profile'"
  );
  
  fs.writeFileSync('src/pages/admin/AdminDashboard.tsx', code);
}
