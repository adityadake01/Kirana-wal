import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, collection, query, getDocs, addDoc } from 'firebase/firestore';
import { MapPin, Star, Clock, Phone, ShoppingCart, Plus, Minus, ChevronRight } from 'lucide-react';
import { db } from '../lib/firebase';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';

export default function ShopPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [checkingOut, setCheckingOut] = useState(false);
  const { shopId } = useParams<{ shopId: string }>();
  const [shop, setShop] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Dummy cart state for UI demo
  const [cart, setCart] = useState<{ [id: string]: number }>({});

  
  const handleCheckout = async () => {
    if (!user) {
      alert("Please login to place an order.");
      navigate('/login');
      return;
    }
    
    setCheckingOut(true);
    try {
      const items = Object.entries(cart).map(([productId, quantity]) => {
        const product = products.find(p => p.id === productId);
        return {
          productId,
          name: product.name,
          price: Number(product.price),
          quantity: quantity as number
        };
      });

      const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0) + 40; // 40 is delivery fee

      const orderData = {
        customerId: user.uid,
        customerName: user.displayName || 'Customer',
        customerPhone: user.phoneNumber || '',
        sellerId: shopId,
        shopName: shop.name,
        items,
        totalAmount,
        status: 'Pending',
        paymentMethod: 'COD',
        paymentStatus: 'Pending',
        deliveryAddress: 'Default Customer Address', // Could be fetched from user profile
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const orderRef = await addDoc(collection(db, 'orders'), orderData);
      
      await addDoc(collection(db, 'notifications'), {
        recipientId: shopId,
        title: 'New Order Received!',
        message: `You received a new order for ₹${totalAmount} from ${user.displayName || 'a customer'}.`,
        read: false,
        createdAt: new Date().toISOString(),
        actionUrl: '/shopkeeper?tab=orders'
      });
      
      setCart({});
      alert("Order placed successfully!");
      
    } catch (err) {
      console.error("Checkout error:", err);
      alert("Failed to place order.");
    } finally {
      setCheckingOut(false);
    }
  };

  useEffect(() => {
    const fetchShopAndProducts = async () => {
      if (!shopId) return;
      try {
        const shopDoc = await getDoc(doc(db, 'shops', shopId));
        if (shopDoc.exists()) {
          setShop({ id: shopDoc.id, ...shopDoc.data() });
          
          // Fetch products
          const q = query(collection(db, 'shops', shopId, 'products'));
          const productsSnap = await getDocs(q);
          const productsData = productsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
          setProducts(productsData);
        } else {
          setShop(null);
          setProducts([]);
        }
      } catch (err) {
        console.warn("Error fetching shop details:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchShopAndProducts();
  }, [shopId]);

  const updateCart = (productId: string, delta: number) => {
    setCart(prev => {
      const current = prev[productId] || 0;
      const next = current + delta;
      if (next <= 0) {
        const { [productId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [productId]: next };
    });
  };

  if (loading) {
    return <div className="flex h-screen items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-emerald-500 rounded-full border-t-transparent"></div></div>;
  }

  if (!shop) return <div className="p-8 text-center">Shop not found.</div>;

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      {/* Shop Header Banner */}
      <div className="h-64 md:h-80 w-full relative">
        <img src={shop.image} alt={shop.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 max-w-7xl mx-auto text-white">
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-3xl md:text-5xl font-bold mb-2">{shop.name}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm md:text-base text-gray-200">
                <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {shop.address}</span>
                <span className="flex items-center gap-1"><Star className="h-4 w-4 text-yellow-400 fill-yellow-400" /> {shop.rating || '4.5'} Rating</span>
                <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> 30 mins delivery</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Main Content - Products */}
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">All Products</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map(product => (
                <div key={product.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-col">
                  <div className="h-40 w-full mb-4 rounded-xl overflow-hidden bg-gray-50">
                    <img src={product.image} alt={product.name} className="w-full h-full object-contain mix-blend-multiply" />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 leading-tight">{product.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{product.weight}</p>
                  </div>
                  
                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-lg font-bold text-gray-900">₹{product.price}</div>
                    
                    {cart[product.id] ? (
                      <div className="flex items-center bg-emerald-50 rounded-lg p-1 border border-emerald-100">
                        <button onClick={() => updateCart(product.id, -1)} className="p-1 rounded-md text-emerald-600 hover:bg-emerald-100">
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="px-3 font-semibold text-emerald-600">{cart[product.id]}</span>
                        <button onClick={() => updateCart(product.id, 1)} className="p-1 rounded-md text-emerald-600 hover:bg-emerald-100">
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => updateCart(product.id, 1)}
                        className="bg-white border-2 border-emerald-500 text-emerald-600 font-semibold px-4 py-1.5 rounded-lg hover:bg-emerald-50 transition-colors"
                      >
                        Add
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Sidebar - Cart Summary (Desktop) */}
          <div className="hidden md:block w-80 shrink-0">
            <div className="sticky top-24 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
                <ShoppingCart className="h-5 w-5 text-emerald-500" />
                Your Cart
              </h3>
              
              {Object.keys(cart).length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <ShoppingCart className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                  <p>Your cart is empty</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4 max-h-80 overflow-y-auto mb-4 pr-2">
                    {Object.entries(cart).map(([productId, quantity]) => {
                      const product = products.find(p => p.id === productId);
                      if (!product) return null;
                      const productPrice = Number(product.price) || 0;
                      return (
                        <div key={productId} className="flex justify-between items-start text-sm">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 line-clamp-1">{product.name}</p>
                            <p className="text-gray-500">₹{productPrice} x {quantity as number}</p>
                          </div>
                          <p className="font-bold text-gray-900">₹{productPrice * (quantity as number)}</p>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="border-t border-gray-100 pt-4 space-y-2 mb-6">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Item Total</span>
                      <span>₹{Object.entries(cart).reduce((sum: number, [id, q]) => sum + (Number(products.find(p=>p.id===id)?.price) || 0) * (q as number), 0)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Delivery Fee</span>
                      <span>₹40</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg text-gray-900 pt-2 border-t border-gray-100">
                      <span>To Pay</span>
                      <span>₹{Object.entries(cart).reduce((sum: number, [id, q]) => sum + (Number(products.find(p=>p.id===id)?.price) || 0) * (q as number), 0) + 40}</span>
                    </div>
                  </div>
                  
                  <button disabled={checkingOut} onClick={handleCheckout} className="w-full bg-emerald-500 text-white font-bold py-3 rounded-xl hover:bg-emerald-600 transition-colors shadow-sm disabled:opacity-50">
    {checkingOut ? 'Processing...' : 'Checkout'}
  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile Floating Cart Button */}
      {Object.keys(cart).length > 0 && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-40">
          <button className="w-full bg-emerald-500 text-white font-bold py-3 px-4 rounded-xl shadow-sm flex items-center justify-between">
            <div className="flex flex-col text-left">
              <span className="text-xs text-emerald-200">{Object.values(cart).reduce((a: number,b: any)=>a+(b as number),0)} items</span>
              <span>₹{Object.entries(cart).reduce((sum: number, [id, q]) => sum + (Number(products.find(p=>p.id===id)?.price) || 0) * (q as number), 0) + 40}</span>
            </div>
            <span onClick={(e) => { e.stopPropagation(); handleCheckout(); }} className="flex items-center gap-2 z-10 px-4 py-2 bg-white/20 rounded-lg">{checkingOut ? 'Wait...' : 'Checkout'} <ChevronRight className="h-5 w-5" /></span>
          </button>
        </div>
      )}
    </div>
  );
}
