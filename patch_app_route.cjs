const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

if (!code.includes('import Notifications')) {
  code = code.replace("import CustomerDashboard from './pages/customer/CustomerDashboard';", 
    "import Notifications from './pages/Notifications';\nimport CustomerDashboard from './pages/customer/CustomerDashboard';");
}

if (!code.includes('path="/notifications"')) {
  code = code.replace('<Route path="/pending-approval" element={<PendingApproval />} />',
    '<Route path="/pending-approval" element={<PendingApproval />} />\n            <Route path="/notifications" element={<Notifications />} />');
}

fs.writeFileSync('src/App.tsx', code);
