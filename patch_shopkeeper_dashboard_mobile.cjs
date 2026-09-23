const fs = require('fs');
let code = fs.readFileSync('src/pages/shopkeeper/ShopkeeperDashboard.tsx', 'utf8');

// 1. Import Menu and X from lucide-react if not present
if (!code.includes('Menu,')) {
    code = code.replace("import { ", "import { Menu, ");
}

// 2. Add state for mobile sidebar
if (!code.includes('isMobileMenuOpen')) {
    code = code.replace(
        "const [activeTab, setActiveTab] = useState(tabParam);",
        "const [activeTab, setActiveTab] = useState(tabParam);\n  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);"
    );
    
    code = code.replace(
        "const handleTabChange = (id: string) => {",
        "const handleTabChange = (id: string) => {\n    setIsMobileMenuOpen(false);"
    );
}

// 3. Make sidebar toggleable
const sidebarStart = '<div className="w-64 bg-white shadow-xl hidden md:flex flex-col z-10 shrink-0">';
const sidebarReplacement = `      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={\`\${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:static inset-y-0 left-0 w-64 bg-white shadow-xl flex flex-col z-50 shrink-0 transition-transform duration-300 ease-in-out\`}>`;
      
if (code.includes(sidebarStart)) {
    code = code.replace(sidebarStart, sidebarReplacement);
}

// 4. Add mobile header
const headerStart = '{/* Header */}';
const headerReplacement = `{/* Mobile Header */}
        <div className="md:hidden bg-white border-b border-gray-100 p-4 flex items-center justify-between shrink-0 shadow-sm z-10">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg">
              <Menu size={24} />
            </button>
            <h2 className="text-xl font-bold text-gray-800 capitalize">{activeTab} Panel</h2>
          </div>
        </div>

        {/* Header */}`;

if (code.includes(headerStart) && !code.includes('Mobile Header')) {
    code = code.replace(headerStart, headerReplacement);
}

fs.writeFileSync('src/pages/shopkeeper/ShopkeeperDashboard.tsx', code);
console.log("ShopkeeperDashboard mobile navigation patched.");
