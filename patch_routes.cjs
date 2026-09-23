const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

if (!code.includes("/customer/profile")) {
  const routesStr = `<Route path="/notifications" element={<Notifications />} />`;
  const newRoutesStr = `<Route path="/notifications" element={<Notifications />} />
            
            <Route path="/customer/profile" element={<Navigate to="/dashboard?tab=profile" replace />} />
            <Route path="/seller/profile" element={<Navigate to="/shopkeeper?tab=settings" replace />} />
            <Route path="/admin/profile" element={<Navigate to="/admin?tab=profile" replace />} />
            <Route path="/store/:sellerId" element={<Navigate to="/shop/:sellerId" replace />} />`;
            
  code = code.replace(routesStr, newRoutesStr);
  fs.writeFileSync('src/App.tsx', code);
}
