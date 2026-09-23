import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Store, Package, Loader2, ArrowRight } from 'lucide-react';
import { collection, collectionGroup, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';

interface SearchShop {
  id: string;
  name: string;
  address?: string;
  category?: string;
  image?: string;
  rating?: string | number;
}

interface SearchProduct {
  id: string;
  name: string;
  price: number;
  category?: string;
  image?: string;
  shopId?: string;
  shopName?: string;
}

export default function GlobalSearchBar({ className = '' }: { className?: string }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shops, setShops] = useState<SearchShop[]>([]);
  const [products, setProducts] = useState<SearchProduct[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Load all shops and products for instantaneous, responsive client-side filtering
  const loadSearchData = async () => {
    if (dataLoaded) return;
    setLoading(true);
    try {
      // 1. Fetch active shops
      const shopsSnap = await getDocs(collection(db, 'shops'));
      const loadedShops: SearchShop[] = [];
      const shopMap = new Map<string, string>();

      shopsSnap.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.status === 'active' || !data.status) {
          const shopName = data.shopName || data.name || 'Local Kirana Store';
          loadedShops.push({
            id: docSnap.id,
            name: shopName,
            address: data.address || data.landmark || '',
            category: data.category || 'General Store',
            image: data.image || data.shopImage || '',
            rating: data.rating || '4.5'
          });
          shopMap.set(docSnap.id, shopName);
        }
      });
      setShops(loadedShops);

      // 2. Fetch products via collectionGroup & root products
      const loadedProducts: SearchProduct[] = [];
      const seenProductIds = new Set<string>();

      try {
        const prodGroupSnap = await getDocs(collectionGroup(db, 'products'));
        prodGroupSnap.forEach((docSnap) => {
          const data = docSnap.data();
          if (data.name && !seenProductIds.has(docSnap.id)) {
            seenProductIds.add(docSnap.id);
            const parentShopId = docSnap.ref.parent?.parent?.id || data.shopId || (loadedShops[0]?.id || '');
            loadedProducts.push({
              id: docSnap.id,
              name: data.name,
              price: Number(data.price) || 0,
              category: data.category || '',
              image: data.image || '',
              shopId: parentShopId,
              shopName: shopMap.get(parentShopId) || 'Local Kirana Store'
            });
          }
        });
      } catch (cgErr) {
        console.warn("CollectionGroup error:", cgErr);
      }

      // Also check root 'products' collection if any
      try {
        const rootProdSnap = await getDocs(collection(db, 'products'));
        rootProdSnap.forEach((docSnap) => {
          const data = docSnap.data();
          if (data.name && !seenProductIds.has(docSnap.id)) {
            seenProductIds.add(docSnap.id);
            const sId = data.shopId || (loadedShops[0]?.id || '');
            loadedProducts.push({
              id: docSnap.id,
              name: data.name,
              price: Number(data.price) || 0,
              category: data.category || '',
              image: data.image || '',
              shopId: sId,
              shopName: shopMap.get(sId) || 'Local Kirana Store'
            });
          }
        });
      } catch (rErr) {
        console.warn("Root products error:", rErr);
      }

      setProducts(loadedProducts);
      setDataLoaded(true);
    } catch (err) {
      console.warn("Error loading search data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter items matching search term
  const queryTrimmed = searchTerm.trim().toLowerCase();

  const filteredShops = queryTrimmed
    ? shops.filter(s => 
        s.name.toLowerCase().includes(queryTrimmed) || 
        (s.address && s.address.toLowerCase().includes(queryTrimmed)) ||
        (s.category && s.category.toLowerCase().includes(queryTrimmed))
      ).slice(0, 5)
    : [];

  const filteredProducts = queryTrimmed
    ? products.filter(p => 
        p.name.toLowerCase().includes(queryTrimmed) ||
        (p.category && p.category.toLowerCase().includes(queryTrimmed))
      ).slice(0, 8)
    : [];

  const totalResults = filteredShops.length + filteredProducts.length;

  const handleSelectShop = (shopId: string) => {
    setIsOpen(false);
    setSearchTerm('');
    navigate(`/shop/${shopId}`);
  };

  const handleSelectProduct = (product: SearchProduct) => {
    setIsOpen(false);
    setSearchTerm('');
    if (product.shopId) {
      navigate(`/shop/${product.shopId}`);
    } else if (shops[0]) {
      navigate(`/shop/${shops[0].id}`);
    } else {
      navigate('/shops');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!queryTrimmed) return;
    setIsOpen(false);
    if (filteredShops.length === 1 && filteredProducts.length === 0) {
      handleSelectShop(filteredShops[0].id);
    } else if (filteredProducts.length === 1 && filteredShops.length === 0) {
      handleSelectProduct(filteredProducts[0]);
    } else {
      navigate(`/shops?search=${encodeURIComponent(searchTerm)}`);
    }
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <form onSubmit={handleSubmit} className="relative w-full">
        <div className="relative flex items-center">
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              if (!isOpen) setIsOpen(true);
            }}
            onFocus={() => {
              loadSearchData();
              setIsOpen(true);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Escape') setIsOpen(false);
            }}
            placeholder="दुकान किंवा प्रॉडक्ट शोधा / Search shops or products..."
            className="w-full pl-10 pr-10 py-2 sm:py-2.5 text-sm bg-gray-50 hover:bg-gray-100/80 focus:bg-white border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all placeholder:text-gray-400 text-gray-800"
          />
          <Search className="absolute left-3.5 h-4 w-4 text-gray-400 pointer-events-none" />
          
          {loading ? (
            <Loader2 className="absolute right-3.5 h-4 w-4 text-emerald-500 animate-spin" />
          ) : searchTerm ? (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                inputRef.current?.focus();
              }}
              className="absolute right-3.5 p-0.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      </form>

      {/* Live Dropdown Results */}
      {isOpen && queryTrimmed && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 max-h-[80vh] sm:max-h-[480px] overflow-y-auto z-[70] animate-in fade-in-50 duration-150 divide-y divide-gray-100">
          
          {/* Header summary */}
          <div className="p-3 bg-gray-50/80 text-xs font-medium text-gray-500 flex items-center justify-between">
            <span>Results for "{searchTerm}"</span>
            <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full text-[11px]">
              {totalResults} items
            </span>
          </div>

          {totalResults === 0 ? (
            <div className="p-8 text-center">
              <Package className="h-10 w-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-gray-700">कोणतेही दुकान किंवा प्रॉडक्ट सापडले नाही</p>
              <p className="text-xs text-gray-400 mt-1">No matching shops or products found</p>
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate('/shops');
                }}
                className="mt-3 text-xs font-semibold text-emerald-600 hover:text-emerald-700 underline"
              >
                सर्व उपलब्ध दुकाने पहा (Browse all stores)
              </button>
            </div>
          ) : (
            <>
              {/* SHOPS SECTION */}
              {filteredShops.length > 0 && (
                <div className="p-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-emerald-700 mb-2 flex items-center gap-1.5 px-2">
                    <Store className="h-3.5 w-3.5" />
                    <span>दुकाने / Shops ({filteredShops.length})</span>
                  </div>
                  <div className="space-y-1">
                    {filteredShops.map((shop) => (
                      <button
                        key={`shop-${shop.id}`}
                        onClick={() => handleSelectShop(shop.id)}
                        className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-emerald-50 text-left transition-colors group"
                      >
                        <div className="h-10 w-10 rounded-lg bg-emerald-100 overflow-hidden shrink-0 flex items-center justify-center border border-emerald-200">
                          {shop.image ? (
                            <img src={shop.image} alt={shop.name} className="h-full w-full object-cover" />
                          ) : (
                            <Store className="h-5 w-5 text-emerald-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-900 group-hover:text-emerald-700 truncate">
                            {shop.name}
                          </p>
                          {shop.address && (
                            <p className="text-xs text-gray-500 truncate">{shop.address}</p>
                          )}
                        </div>
                        <div className="text-xs font-medium text-emerald-600 flex items-center gap-1 shrink-0">
                          <span>दुकान पहा</span>
                          <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* PRODUCTS SECTION */}
              {filteredProducts.length > 0 && (
                <div className="p-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-blue-700 mb-2 flex items-center gap-1.5 px-2">
                    <Package className="h-3.5 w-3.5" />
                    <span>वस्तू / Products ({filteredProducts.length})</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {filteredProducts.map((product) => (
                      <button
                        key={`prod-${product.id}`}
                        onClick={() => handleSelectProduct(product)}
                        className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-blue-50 text-left transition-colors group border border-transparent hover:border-blue-100"
                      >
                        <div className="h-11 w-11 rounded-lg bg-gray-100 overflow-hidden shrink-0 flex items-center justify-center border border-gray-200">
                          {product.image ? (
                            <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                          ) : (
                            <Package className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-700 truncate">
                            {product.name}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs font-bold text-emerald-600">₹{product.price}</span>
                            {product.shopName && (
                              <span className="text-[11px] text-gray-400 truncate max-w-[120px]">
                                • {product.shopName}
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* View all shops footer */}
              <div className="p-2.5 bg-gray-50 text-center">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    navigate(`/shops?search=${encodeURIComponent(searchTerm)}`);
                  }}
                  className="w-full py-2 text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center justify-center gap-1.5 transition"
                >
                  <span>"{searchTerm}" साठी सर्व दुकाने व प्रॉडक्ट्स पहा</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
