const fs = require('fs');

let shopCode = fs.readFileSync('src/pages/shopkeeper/ShopkeeperDashboard.tsx', 'utf8');
shopCode = shopCode.replace("import { Menu, useState, useEffect", "import { useState, useEffect");
fs.writeFileSync('src/pages/shopkeeper/ShopkeeperDashboard.tsx', shopCode);

let sellerProfile = fs.readFileSync('src/components/profile/SellerProfile.tsx', 'utf8');
if (!sellerProfile.includes('Camera')) {
    sellerProfile = sellerProfile.replace("import { Store, User, MapPin, Mail, Phone, Edit2, Save } from 'lucide-react';", "import { Store, User, MapPin, Mail, Phone, Edit2, Save, Camera } from 'lucide-react';");
    fs.writeFileSync('src/components/profile/SellerProfile.tsx', sellerProfile);
}

let adminSettings = fs.readFileSync('src/pages/admin/AdminSettings.tsx', 'utf8');
if (!adminSettings.includes("import React")) {
    adminSettings = "import React from 'react';\n" + adminSettings;
    fs.writeFileSync('src/pages/admin/AdminSettings.tsx', adminSettings);
}

