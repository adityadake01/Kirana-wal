const fs = require('fs');
let adminCode = fs.readFileSync('src/pages/admin/AdminDashboard.tsx', 'utf8');

if (!adminCode.includes("auditlogs")) {
  console.log("No auditlogs tab handling yet");
}
