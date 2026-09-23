const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf8');
let login = fs.readFileSync('src/pages/Login.tsx', 'utf8');
let navbar = fs.readFileSync('src/components/layout/Navbar.tsx', 'utf8');

app = app.replace(/firebaseUser\.email === 'adityadake627@gmail\.com'/g, "firebaseUser.email?.toLowerCase() === 'adityadake627@gmail.com'");
app = app.replace(/user\.email === 'adityadake627@gmail\.com'/g, "user.email?.toLowerCase() === 'adityadake627@gmail.com'");

login = login.replace(/authUser\.email === 'adityadake627@gmail\.com'/g, "authUser.email?.toLowerCase() === 'adityadake627@gmail.com'");

navbar = navbar.replace(/user\.email === 'adityadake627@gmail\.com'/g, "user.email?.toLowerCase() === 'adityadake627@gmail.com'");

fs.writeFileSync('src/App.tsx', app);
fs.writeFileSync('src/pages/Login.tsx', login);
fs.writeFileSync('src/components/layout/Navbar.tsx', navbar);
