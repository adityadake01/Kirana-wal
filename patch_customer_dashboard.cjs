const fs = require('fs');
let code = fs.readFileSync('src/pages/customer/CustomerDashboard.tsx', 'utf8');

if (!code.includes("import CustomerProfile")) {
  code = code.replace(
    "import { useAuthStore } from '../../store/authStore';",
    "import { useAuthStore } from '../../store/authStore';\nimport CustomerProfile from '../../components/profile/CustomerProfile';\nimport { User } from 'lucide-react';"
  );
  
  // Add menu button
  const ordersBtnStr = `<button 
                onClick={() => setActiveTab('orders')}
                className={\`px-6 py-4 text-left font-medium text-sm transition-colors \${activeTab === 'orders' ? 'bg-emerald-50 text-emerald-600 border-l-4 border-emerald-500' : 'text-gray-600 hover:bg-gray-50'}\`}
              >
                My Orders
              </button>`;
              
  const newBtnsStr = `<button 
                onClick={() => setActiveTab('orders')}
                className={\`px-6 py-4 text-left font-medium text-sm transition-colors flex items-center gap-2 \${activeTab === 'orders' ? 'bg-emerald-50 text-emerald-600 border-l-4 border-emerald-500' : 'text-gray-600 hover:bg-gray-50'}\`}
              >
                <Package className="h-4 w-4" /> My Orders
              </button>
              <button 
                onClick={() => setActiveTab('profile')}
                className={\`px-6 py-4 text-left font-medium text-sm transition-colors flex items-center gap-2 \${activeTab === 'profile' ? 'bg-emerald-50 text-emerald-600 border-l-4 border-emerald-500' : 'text-gray-600 hover:bg-gray-50'}\`}
              >
                <User className="h-4 w-4" /> My Profile
              </button>`;
              
  code = code.replace(ordersBtnStr, newBtnsStr);
  
  // Add content
  const contentStartStr = `        {/* Main Content */}
        <div className="flex-1">
          {activeTab === 'orders' && (`;
          
  const newContentStartStr = `        {/* Main Content */}
        <div className="flex-1">
          {activeTab === 'profile' && <CustomerProfile />}
          {activeTab === 'orders' && (`;
          
  code = code.replace(contentStartStr, newContentStartStr);
  
  fs.writeFileSync('src/pages/customer/CustomerDashboard.tsx', code);
}
