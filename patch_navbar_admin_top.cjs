const fs = require('fs');
let code = fs.readFileSync('src/components/layout/Navbar.tsx', 'utf8');

const adminTopLink = `
              {role === 'admin' && (
                <Link to="/admin" className="text-emerald-600 font-bold hover:text-emerald-700 transition-colors">
                  Admin Panel
                </Link>
              )}
`;

if (!code.includes('Admin Panel')) {
  code = code.replace(/\{!\s*user\s*\?\s*\(/, `${adminTopLink}\n              {!user ? (`);
}

fs.writeFileSync('src/components/layout/Navbar.tsx', code);
