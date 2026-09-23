const fs = require('fs');
let code = fs.readFileSync('src/components/layout/Navbar.tsx', 'utf8');

if (!code.includes('useNotificationStore')) {
  code = code.replace("import { useSettingsStore } from '../../store/settingsStore';", 
    "import { useSettingsStore } from '../../store/settingsStore';\nimport { useNotificationStore } from '../../store/notificationStore';");
}

if (!code.includes('const { unreadCount } = useNotificationStore();')) {
  code = code.replace("const { logoUrl } = useSettingsStore();", 
    "const { logoUrl } = useSettingsStore();\n  const { unreadCount } = useNotificationStore();");
}

code = code.replace(/<Bell className="h-6 w-6" \/>/g, 
  `<Bell className="h-6 w-6" />
                    {unreadCount > 0 && (
                      <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-orange-500 rounded-full">
                        {unreadCount}
                      </span>
                    )}`);

fs.writeFileSync('src/components/layout/Navbar.tsx', code);
