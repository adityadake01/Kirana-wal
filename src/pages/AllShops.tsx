import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { MapPin, Star, Clock, ChevronRight, Search, X } from 'lucide-react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function AllShops() {
  const [shops, setShops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const searchFilter = searchParams.get('search') || '';

  useEffect(() => {
    const fetchShops = async () => {
      try {
        const q = query(collection(db, 'shops'), where('status', '==', 'active'));
        const querySnapshot = await getDocs(q);
        const shopsData = querySnapshot.docs.map(doc => ({ 
          id: doc.id, 
          name: doc.data().shopName || doc.data().name || 'Store',
          ...doc.data() 
        }));
        setShops(shopsData);
      } catch (error) {
        console.warn("Error fetching shops:", error);
        setShops([]);
      } finally {
        setLoading(false);
      }
    };

    fetchShops();
  }, []);

  const filteredShops = searchFilter.trim()
    ? shops.filter(shop => {
        const q = searchFilter.toLowerCase();
        return (
          (shop.name && shop.name.toLowerCase().includes(q)) ||
          (shop.shopName && shop.shopName.toLowerCase().includes(q)) ||
          (shop.address && shop.address.toLowerCase().includes(q)) ||
          (shop.category && shop.category.toLowerCase().includes(q))
        );
      })
    : shops;

  return (
    <div className="bg-gray-50 min-h-screen py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              सर्व उपलब्ध दुकाने (All Available Shops)
            </h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">
              Discover and shop from local grocery stores near you.
            </p>
          </div>

          {searchFilter && (
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-full text-xs font-semibold text-emerald-800 self-start md:self-auto">
              <span>शोध: "{searchFilter}"</span>
              <button 
                onClick={() => setSearchParams({})}
                className="hover:bg-emerald-200 p-0.5 rounded-full text-emerald-700 transition"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="bg-white rounded-2xl h-72 animate-pulse shadow-sm"></div>
            ))}
          </div>
        ) : filteredShops.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center max-w-lg mx-auto">
            <Search className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-gray-900 mb-1">कोणतेही दुकान सापडले नाही</h3>
            <p className="text-gray-500 text-sm mb-4">"{searchFilter}" शी जुळणारे कोणतेही दुकान उपलब्ध नाही.</p>
            <button
              onClick={() => setSearchParams({})}
              className="bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-full hover:bg-emerald-700 transition shadow-sm"
            >
              सर्व दुकाने पुन्हा दाखवा (Clear Search)
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredShops.map((shop) => (
              <Link to={`/shop/${shop.id}`} key={shop.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-gray-100 group flex flex-col">
                <div className="relative h-48 overflow-hidden shrink-0">
                  <img 
                    src={shop.image || 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&q=80&w=800'} 
                    alt={shop.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-gray-900 text-xs font-bold px-2 py-1 rounded shadow flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    {shop.rating || '4.5'}
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-emerald-600 transition-colors">{shop.name}</h3>
                  <p className="text-gray-500 text-sm mb-4 line-clamp-1">{shop.address}</p>
                  
                  <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Clock className="h-4 w-4 text-emerald-500" />
                      <span>30m</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <MapPin className="h-4 w-4 text-emerald-500" />
                      <span>{shop.distance || '1.5 km'}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
