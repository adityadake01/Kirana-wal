const fs = require('fs');

function fixFile(file) {
    let code = fs.readFileSync(file, 'utf8');
    // Remove "Menu, " from react-router-dom import if it exists
    code = code.replace("import { Menu, useNavigate", "import { useNavigate");
    
    // Add Menu to lucide-react import
    if (code.includes('lucide-react') && !code.match(/import\s+{([^}]*)Menu([^}]*)}\s+from\s+['"]lucide-react['"]/)) {
        code = code.replace("} from 'lucide-react';", ", Menu } from 'lucide-react';");
    }
    
    fs.writeFileSync(file, code);
}

fixFile('src/pages/admin/AdminDashboard.tsx');
fixFile('src/pages/shopkeeper/ShopkeeperDashboard.tsx');
console.log("Fixed Menu imports.");
