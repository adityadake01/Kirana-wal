const fs = require('fs');
let code = fs.readFileSync('src/pages/customer/CustomerDashboard.tsx', 'utf8');
if (!code.includes("useSearchParams")) {
  code = code.replace("import { useState, useEffect } from 'react';", "import { useState, useEffect } from 'react';\nimport { useSearchParams } from 'react-router-dom';");
  
  code = code.replace("const [activeTab, setActiveTab] = useState('orders');", `const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab') || 'orders';
  const [activeTab, setActiveTab] = useState(tabParam);
  
  useEffect(() => {
    if (tabParam) setActiveTab(tabParam);
  }, [tabParam]);
  
  const handleTabChange = (id: string) => {
    setActiveTab(id);
    setSearchParams({ tab: id });
  };`);

  code = code.replace(/setActiveTab\('orders'\)/g, "handleTabChange('orders')");
  code = code.replace(/setActiveTab\('profile'\)/g, "handleTabChange('profile')");
  
  fs.writeFileSync('src/pages/customer/CustomerDashboard.tsx', code);
}
