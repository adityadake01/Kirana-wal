const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminDashboard.tsx', 'utf8');

const effectCode = `  const [pendingSellers, setPendingSellers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for pending sellers
    const q = query(collection(db, 'shops'), where('status', '==', 'pending'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const sellers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPendingSellers(sellers);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);`;

const newEffectCode = `  const [pendingSellers, setPendingSellers] = useState<any[]>([]);
  const [stats, setStats] = useState({ users: 0, shops: 0, orders: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for pending sellers
    const q = query(collection(db, 'shops'), where('status', '==', 'pending'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const sellers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPendingSellers(sellers);
      setLoading(false);
    });

    const fetchStats = async () => {
      try {
        const usersSnap = await getDocs(collection(db, 'users'));
        const shopsSnap = await getDocs(collection(db, 'shops'));
        const ordersSnap = await getDocs(collection(db, 'orders'));
        setStats({
          users: usersSnap.docs.filter(d => d.data().role === 'customer').length,
          shops: shopsSnap.docs.length,
          orders: ordersSnap.docs.length
        });
      } catch (err) {
        console.error(err);
      }
    };
    fetchStats();

    return () => unsubscribe();
  }, []);`;

code = code.replace(effectCode, newEffectCode);

const overviewContent = `            {activeTab === 'overview' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition cursor-pointer" onClick={() => handleTabChange('sellers')}>
                           <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                              <Store size={24} />
                           </div>
                           <div>
                              <p className="text-sm text-gray-500 font-medium">Pending Sellers</p>
                              <h3 className="text-2xl font-bold text-gray-900">{pendingSellers.length}</h3>
                           </div>
                        </div>
                    </div>
                </div>
            )}`;

const newOverviewContent = `            {activeTab === 'overview' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition cursor-pointer" onClick={() => handleTabChange('sellers')}>
                           <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                              <Store size={24} />
                           </div>
                           <div>
                              <p className="text-sm text-gray-500 font-medium">Pending Sellers</p>
                              <h3 className="text-2xl font-bold text-gray-900">{pendingSellers.length}</h3>
                           </div>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition cursor-pointer" onClick={() => handleTabChange('sellers')}>
                           <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
                              <Store size={24} />
                           </div>
                           <div>
                              <p className="text-sm text-gray-500 font-medium">Total Shops</p>
                              <h3 className="text-2xl font-bold text-gray-900">{stats.shops}</h3>
                           </div>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition cursor-pointer" onClick={() => handleTabChange('users')}>
                           <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
                              <Users size={24} />
                           </div>
                           <div>
                              <p className="text-sm text-gray-500 font-medium">Customers</p>
                              <h3 className="text-2xl font-bold text-gray-900">{stats.users}</h3>
                           </div>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition">
                           <div className="p-3 bg-orange-50 text-orange-600 rounded-lg">
                              <DollarSign size={24} />
                           </div>
                           <div>
                              <p className="text-sm text-gray-500 font-medium">Total Orders</p>
                              <h3 className="text-2xl font-bold text-gray-900">{stats.orders}</h3>
                           </div>
                        </div>
                    </div>
                </div>
            )}`;

code = code.replace(overviewContent, newOverviewContent);
fs.writeFileSync('src/pages/admin/AdminDashboard.tsx', code);
