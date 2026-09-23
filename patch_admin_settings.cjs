const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminDashboard.tsx', 'utf8');

if (!code.includes('import AdminSettings')) {
  code = code.replace("import { useAuthStore } from '../../store/authStore';", 
    "import { useAuthStore } from '../../store/authStore';\nimport AdminSettings from './AdminSettings';");
}

code = code.replace(
  /\{activeTab !== 'overview' && activeTab !== 'sellers' && \([\s\S]*?\}\)/,
  `{activeTab === 'settings' && (
                <div className="animate-in fade-in duration-300">
                   <AdminSettings />
                </div>
            )}
            
            {activeTab !== 'overview' && activeTab !== 'sellers' && activeTab !== 'settings' && (
                <div className="flex items-center justify-center h-full min-h-[400px]">
                   <div className="text-center text-gray-400">
                      <LayoutDashboard size={48} className="mx-auto mb-4 opacity-20" />
                      <h2 className="text-xl font-medium">{activeTab} Panel Content goes here</h2>
                      <p className="text-sm mt-2">Architecture is ready for future expansion.</p>
                   </div>
                </div>
            )}`
);

fs.writeFileSync('src/pages/admin/AdminDashboard.tsx', code);
