const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminDashboard.tsx', 'utf8');

if (!code.includes("import AdminCustomerList")) {
  code = code.replace(
    "import AdminProfile from '../../components/profile/AdminProfile';",
    "import AdminProfile from '../../components/profile/AdminProfile';\nimport AdminCustomerList from './AdminCustomerList';"
  );
  fs.writeFileSync('src/pages/admin/AdminDashboard.tsx', code);
}
