const fs = require('fs');
let code = fs.readFileSync('src/pages/ShopPage.tsx', 'utf8');

// 1. Add imports
if (!code.includes('addDoc')) {
  code = code.replace(/getDocs } from 'firebase\/firestore';/, "getDocs, addDoc } from 'firebase/firestore';");
}
if (!code.includes('useAuthStore')) {
  code = code.replace(/import { db } from '\.\.\/lib\/firebase';/, "import { db } from '../lib/firebase';\nimport { useAuthStore } from '../store/authStore';\nimport { useNavigate } from 'react-router-dom';");
}

// 2. Add useAuthStore, useNavigate and handleCheckout
if (!code.includes('const { user } = useAuthStore();')) {
  code = code.replace(/export default function ShopPage\(\) \{/, `export default function ShopPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [checkingOut, setCheckingOut] = useState(false);`);
}

// 3. Add handleCheckout logic before useEffect
const checkoutLogic = `
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
          quantity: quantity
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

      await addDoc(collection(db, 'orders'), orderData);
      
      setCart({});
      alert("Order placed successfully!");
      
    } catch (err) {
      console.error("Checkout error:", err);
      alert("Failed to place order.");
    } finally {
      setCheckingOut(false);
    }
  };
`;

if (!code.includes('const handleCheckout')) {
  code = code.replace(/useEffect\(\(\) => \{/, checkoutLogic + "\n  useEffect(() => {");
}

// 4. Update the checkout button
code = code.replace(/<button className="w-full bg-emerald-500 text-white font-bold py-3 rounded-xl hover:bg-emerald-600 transition-colors shadow-sm">\s*Checkout\s*<\/button>/g, 
  `<button disabled={checkingOut} onClick={handleCheckout} className="w-full bg-emerald-500 text-white font-bold py-3 rounded-xl hover:bg-emerald-600 transition-colors shadow-sm disabled:opacity-50">
    {checkingOut ? 'Processing...' : 'Checkout'}
  </button>`);

// Update mobile checkout button
code = code.replace(/<span className="flex items-center gap-2">View Cart <ChevronRight className="h-5 w-5" \/><\/span>/, 
  `<span onClick={(e) => { e.stopPropagation(); handleCheckout(); }} className="flex items-center gap-2 z-10 px-4 py-2 bg-white/20 rounded-lg">{checkingOut ? 'Wait...' : 'Checkout'} <ChevronRight className="h-5 w-5" /></span>`);

fs.writeFileSync('src/pages/ShopPage.tsx', code);
