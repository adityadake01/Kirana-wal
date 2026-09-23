const fs = require('fs');
const files = ['src/App.tsx', 'src/pages/Login.tsx', 'src/pages/Register.tsx', 'src/components/layout/Navbar.tsx'];

for (const file of files) {
  let code = fs.readFileSync(file, 'utf8');
  code = code.replace(/toLowerCase\(\) === 'adityadake627@gmail\.com'/g, "trim().toLowerCase() === 'adityadake627@gmail.com'");
  fs.writeFileSync(file, code);
}
