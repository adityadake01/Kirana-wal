const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminDashboard.tsx', 'utf8');

if (!code.includes("useSearchParams")) {
  code = code.replace("import { useNavigate } from 'react-router-dom';", "import { useNavigate, useSearchParams } from 'react-router-dom';");
  
  code = code.replace("const [activeTab, setActiveTab] = useState('overview');", `const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab') || 'overview';
  const [activeTab, setActiveTab] = useState(tabParam);
  
  useEffect(() => {
    if (tabParam) setActiveTab(tabParam);
  }, [tabParam]);
  
  const handleTabChange = (id: string) => {
    setActiveTab(id);
    setSearchParams({ tab: id });
  };`);

  code = code.replace(/setActiveTab\('/g, "handleTabChange('");
  
  fs.writeFileSync('src/pages/admin/AdminDashboard.tsx', code);
}
