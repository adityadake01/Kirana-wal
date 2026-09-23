const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

if (!code.includes('useNotificationStore')) {
  code = code.replace("import { useSettingsStore } from './store/settingsStore';", 
    "import { useSettingsStore } from './store/settingsStore';\nimport { useNotificationStore } from './store/notificationStore';");
}

if (!code.includes('useNotificationStore.getState().init();')) {
  code = code.replace("setUser(firebaseUser, updatedRole, updatedStatus);\n          setLoading(false);", 
    "setUser(firebaseUser, updatedRole, updatedStatus);\n          setLoading(false);\n          useNotificationStore.getState().init();");
  code = code.replace("setUser(firebaseUser, fallbackRole, fallbackStatus);\n          setLoading(false);", 
    "setUser(firebaseUser, fallbackRole, fallbackStatus);\n          setLoading(false);\n          useNotificationStore.getState().init();");
  code = code.replace("setUser(firebaseUser, 'admin');\n           setLoading(false);", 
    "setUser(firebaseUser, 'admin');\n           setLoading(false);\n           useNotificationStore.getState().init();");
  code = code.replace("setUser(null, null, null);\n        setLoading(false);", 
    "setUser(null, null, null);\n        setLoading(false);\n        useNotificationStore.getState().init();");
}

fs.writeFileSync('src/App.tsx', code);
