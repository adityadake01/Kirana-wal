import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Star, Clock, ChevronRight, Search, ChevronDown, BadgeCheck, Tag, Zap, ShieldCheck } from 'lucide-react';
import { collection, getDocs, query, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';

const CATEGORIES = [
  { id: 1, name: 'Grocery', icon: '🧺' },
  { id: 2, name: 'Pulses', icon: '🍛' },
  { id: 3, name: 'Oil & Ghee', icon: '🫙' },
  { id: 4, name: 'Beverages', icon: '🧃' },
  { id: 5, name: 'Snacks', icon: '🥨' },
  { id: 6, name: 'Personal Care', icon: '🧴' },
  { id: 7, name: 'Household', icon: '🧹' },
  { id: 8, name: 'Dairy & Eggs', icon: '🥚' },
  { id: 9, name: 'Baby Care', icon: '🍼' },
  { id: 10, name: 'More', icon: '📦' },
];

export default function Home() {
  const [shops, setShops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShops = async () => {
      try {
        const shopsRef = collection(db, 'shops');
        const q = query(shopsRef, limit(3));
        const querySnapshot = await getDocs(q);
        const shopsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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

  return (
    <div className="bg-white min-h-screen pb-24 font-sans max-w-lg mx-auto md:max-w-none md:px-0">
      
      {/* Location Header */}
      <div className="px-4 py-3 flex items-center gap-2 border-b border-gray-100 md:max-w-7xl md:mx-auto md:w-full">
        <MapPin className="h-5 w-5 text-green-700" />
        <span className="text-sm font-medium text-gray-700">Deliver to: <span className="font-bold text-gray-900">Khadgaon, Aurangabad</span></span>
        <ChevronDown className="h-4 w-4 text-gray-500" />
      </div>

      {/* Search Bar */}
      <div className="px-4 py-4 md:max-w-7xl md:mx-auto md:w-full">
        <div className="relative flex items-center w-full shadow-sm rounded-xl border border-gray-100 overflow-hidden bg-white">
          <Search className="absolute left-3 text-gray-400 h-5 w-5" />
          <input 
            type="text" 
            placeholder="Search for products, categories or stores..." 
            className="w-full pl-10 pr-14 py-3.5 text-sm focus:outline-none text-gray-800"
          />
          <button className="absolute right-1 top-1 bottom-1 bg-green-800 text-white p-2.5 rounded-lg flex items-center justify-center hover:bg-green-900 transition">
            <Search className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Promo Banner */}
      <div className="px-4 mb-8 md:max-w-7xl md:mx-auto md:w-full">
        <div className="bg-[#e8f5e9] rounded-2xl p-6 relative overflow-hidden flex justify-between items-center shadow-sm h-48 md:h-64">
          <div className="w-2/3 md:w-1/2 relative z-10">
            <h2 className="text-xl md:text-3xl font-bold text-[#1b5e20] mb-2 leading-tight">
              Fresh Groceries <br className="md:hidden" />Delivered to <br className="md:hidden" />Your Doorstep!
            </h2>
            <p className="text-sm md:text-base text-[#2e7d32] mb-4 max-w-[200px] md:max-w-sm">
              Quality products from your favorite local stores.
            </p>
            <button className="bg-green-800 text-white text-sm md:text-base font-bold px-4 py-2 rounded-lg flex items-center gap-1 hover:bg-green-900 transition w-max">
              Shop Now <ChevronRight className="h-4 w-4 md:h-5 md:w-5" />
            </button>
          </div>
          
          {/* Banner Image */}
          <div className="absolute right-[-20px] bottom-[-20px] w-1/2 h-[120%] flex items-end justify-end pointer-events-none">
            <img 
              src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=400&h=400" 
              alt="Groceries" 
              className="w-full h-full object-cover rounded-tl-[100px] mix-blend-multiply opacity-90"
            />
          </div>

          {/* Dots */}
          <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-1.5 z-10">
            <div className="w-2 h-2 rounded-full bg-green-800"></div>
            <div className="w-2 h-2 rounded-full bg-green-200"></div>
            <div className="w-2 h-2 rounded-full bg-green-200"></div>
          </div>
        </div>
      </div>

      {/* Shop by Category */}
      <div className="px-4 mb-8 md:max-w-7xl md:mx-auto md:w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg md:text-xl font-bold text-gray-900">Shop by Category</h2>
          <Link to="/categories" className="text-green-700 text-sm font-medium hover:underline">View all</Link>
        </div>
        <div className="grid grid-cols-5 md:grid-cols-10 gap-y-6 gap-x-2">
          {CATEGORIES.map((cat) => (
            <Link to={`/category/${cat.name.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')}`} key={cat.id} className="flex flex-col items-center">
              <div className="w-14 h-14 md:w-20 md:h-20 rounded-2xl bg-gray-50 flex items-center justify-center text-2xl md:text-3xl mb-2 shadow-sm border border-gray-100 transition-transform active:scale-95 hover:shadow-md">
                {cat.icon}
              </div>
              <span className="text-[10px] md:text-sm font-medium text-gray-800 text-center leading-tight">{cat.name}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Popular Stores Near You */}
      <div className="px-4 mb-8 md:max-w-7xl md:mx-auto md:w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg md:text-xl font-bold text-gray-900">Popular Stores Near You</h2>
          <Link to="/shops" className="text-green-700 text-sm font-medium hover:underline">View all</Link>
        </div>
        
        <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide snap-x md:grid md:grid-cols-3 md:overflow-visible">
          {loading ? (
            [1, 2, 3].map(n => <div key={n} className="min-w-[240px] md:w-full h-48 bg-gray-100 rounded-xl animate-pulse shrink-0 snap-start"></div>)
          ) : shops.length > 0 ? (
            shops.map((shop) => (
              <Link to={`/shop/${shop.id}`} key={shop.id} className="min-w-[260px] max-w-[260px] md:min-w-0 md:max-w-none md:w-full bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 shrink-0 snap-start group block">
                <div className="relative h-36 md:h-48 overflow-hidden">
                  <img 
                    src={shop.image || 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&q=80&w=800'} 
                    alt={shop.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 left-2 bg-green-700 text-white text-[10px] md:text-xs font-bold px-2 py-0.5 md:py-1 rounded flex items-center gap-1 shadow">
                    4.6 <Star className="h-2.5 w-2.5 md:h-3 md:w-3 fill-current" />
                  </div>
                </div>
                <div className="p-3 md:p-4">
                  <h3 className="text-base md:text-lg font-bold text-gray-900 mb-0.5 truncate">{shop.name}</h3>
                  <p className="text-gray-500 text-xs md:text-sm mb-2 truncate">{shop.address}</p>
                  
                  <div className="flex items-center gap-2 text-xs md:text-sm text-gray-600 font-medium">
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3 md:h-4 md:w-4 text-gray-400" /> 30 min</span>
                    <span className="text-gray-300">•</span>
                    <span>₹0 Delivery</span>
                  </div>
                </div>
              </Link>
            ))
          ) : (
             <div className="w-full text-center py-8 bg-gray-50 rounded-xl border border-gray-100 md:col-span-3">
               <p className="text-gray-500 font-medium">No nearby shops found.</p>
             </div>
          )}
        </div>
      </div>

      {/* Features Banner */}
      <div className="px-4 mb-6 md:max-w-7xl md:mx-auto md:w-full">
        <div className="bg-[#f1f8f3] rounded-xl p-4 md:p-6 flex justify-between items-center md:gap-8">
          <div className="flex flex-col md:flex-row items-center md:justify-center flex-1 text-center md:text-left border-r border-green-200/50 md:border-0 last:border-0 px-1 md:gap-3">
            <BadgeCheck className="h-6 w-6 md:h-10 md:w-10 text-green-600 mb-1 md:mb-0" />
            <span className="text-[10px] md:text-sm font-bold text-gray-800 leading-tight">Best Quality<br className="md:hidden"/><span className="hidden md:inline"> </span><span className="font-medium text-gray-500">Products</span></span>
          </div>
          <div className="flex flex-col md:flex-row items-center md:justify-center flex-1 text-center md:text-left border-r border-green-200/50 md:border-0 last:border-0 px-1 md:gap-3">
            <Tag className="h-6 w-6 md:h-10 md:w-10 text-green-600 mb-1 md:mb-0" />
            <span className="text-[10px] md:text-sm font-bold text-gray-800 leading-tight">Low Prices<br className="md:hidden"/><span className="hidden md:inline"> </span><span className="font-medium text-gray-500">Everyday</span></span>
          </div>
          <div className="flex flex-col md:flex-row items-center md:justify-center flex-1 text-center md:text-left border-r border-green-200/50 md:border-0 last:border-0 px-1 md:gap-3">
            <Zap className="h-6 w-6 md:h-10 md:w-10 text-green-600 mb-1 md:mb-0" />
            <span className="text-[10px] md:text-sm font-bold text-gray-800 leading-tight">Fast Delivery<br className="md:hidden"/><span className="hidden md:inline"> </span><span className="font-medium text-gray-500">On time</span></span>
          </div>
          <div className="flex flex-col md:flex-row items-center md:justify-center flex-1 text-center md:text-left px-1 md:gap-3">
            <ShieldCheck className="h-6 w-6 md:h-10 md:w-10 text-green-600 mb-1 md:mb-0" />
            <span className="text-[10px] md:text-sm font-bold text-gray-800 leading-tight">Safe & Secure<br className="md:hidden"/><span className="hidden md:inline"> </span><span className="font-medium text-gray-500">Shopping</span></span>
          </div>
        </div>
      </div>

    </div>
  );
}
