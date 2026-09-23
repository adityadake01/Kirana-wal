const fs = require('fs');
let code = fs.readFileSync('src/components/layout/Navbar.tsx', 'utf8');

// 1. imports
if (!code.includes('useSettingsStore')) {
  code = code.replace("import { useAuthStore } from '../../store/authStore';", 
    "import { useAuthStore } from '../../store/authStore';\nimport { useSettingsStore } from '../../store/settingsStore';\nimport { Bell } from 'lucide-react';");
}

// 2. hook call
if (!code.includes('const { logoUrl } = useSettingsStore();')) {
  code = code.replace("const { user, role } = useAuthStore();", 
    "const { user, role } = useAuthStore();\n  const { logoUrl } = useSettingsStore();");
}

// 3. Desktop Logo
code = code.replace(
  /<Link to="\/" className="flex items-center gap-2">[\s\S]*?<\/span>\s*<\/Link>/,
  `<Link to="/" className="flex items-center gap-2">
                {logoUrl ? (
                  <img src={logoUrl} alt="Logo" className="h-8 max-w-[150px] object-contain" />
                ) : (
                  <>
                    <Store className="h-8 w-8 text-green-700" />
                    <span className="text-2xl font-bold text-gray-900 tracking-tight">
                      <span className="text-green-700">Kirana</span>wala
                    </span>
                  </>
                )}
              </Link>`
);

// 4. Mobile Logo
code = code.replace(
  /<div className="flex-1 flex justify-center md:hidden">[\s\S]*?<\/div>/,
  `<div className="flex-1 flex justify-center md:hidden">
              <Link to="/" className="flex items-center gap-1.5">
                {logoUrl ? (
                  <img src={logoUrl} alt="Logo" className="h-7 max-w-[120px] object-contain" />
                ) : (
                  <>
                    <Store className="h-7 w-7 text-green-700" />
                    <span className="text-xl font-bold text-gray-900 tracking-tight">
                      <span className="text-green-700">Kirana</span>wala
                    </span>
                  </>
                )}
              </Link>
            </div>`
);

// 5. Add Notification Bell before the profile dropdown in Desktop
const notifHtmlDesktop = `
                  <Link to="/notifications" className="relative p-2 text-gray-600 hover:text-emerald-600 transition-colors">
                    <Bell className="h-6 w-6" />
                    {/* Live notification badge will be handled dynamically */}
                  </Link>
`;
if (!code.includes('<Bell')) {
  code = code.replace(/<div className="relative group">\s*<button className="flex items-center gap-2 p-2 text-gray-600 hover:text-emerald-600 transition-colors">/, 
    `${notifHtmlDesktop}\n                  <div className="relative group">\n                    <button className="flex items-center gap-2 p-2 text-gray-600 hover:text-emerald-600 transition-colors">`);
  
  // Mobile nav notifications
  code = code.replace(/<div className="flex items-center gap-2 md:hidden">/,
    `<div className="flex items-center gap-2 md:hidden">
              {user && (
                <Link to="/notifications" className="relative p-2 text-gray-600 hover:text-emerald-600 transition-colors">
                  <Bell className="h-6 w-6" />
                </Link>
              )}`
  );
}

fs.writeFileSync('src/components/layout/Navbar.tsx', code);
