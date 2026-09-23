import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, updateDoc, addDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuthStore } from '../../store/authStore';
import { ShoppingCart, Loader2, Search, Filter } from 'lucide-react';

export default function SellerOrders() {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    if (!user?.uid) return;
    
    // We fetch orders where this seller is involved. 
    // Wait, the prompt suggested "sellerOrders" or "orders". Let's use "orders" with sellerId.
    const q = query(
      collection(db, 'orders'), 
      where('sellerId', '==', user.uid)
      // orderBy('createdAt', 'desc') // Need composite index, so skip orderBy for now
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      let data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      // Sort manually since we can't use orderBy without index easily
      data.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setOrders(data);
      setLoading(false);
    }, (err) => {
      console.warn("Error fetching orders:", err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const updateOrderStatus = async (orderId: string, status: string, customerId: string) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status,
        updatedAt: new Date().toISOString()
      });
      
      if (customerId) {
        await addDoc(collection(db, 'notifications'), {
          recipientId: customerId,
          title: 'Order Status Updated',
          message: `Your order #${orderId.slice(-6).toUpperCase()} is now ${status}.`,
          read: false,
          createdAt: new Date().toISOString(),
          actionUrl: '/dashboard'
        });
      }
    } catch (err) {
      console.error("Error updating order:", err);
      alert("Failed to update order status.");
    }
  };

  const filteredOrders = filter === 'All' ? orders : orders.filter(o => o.status === filter);

  if (loading) {
    return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-emerald-500" /></div>;
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
          {['All', 'Pending', 'Accepted', 'Preparing', 'Ready', 'Dispatched', 'Delivered', 'Cancelled'].map(f => (
            <button 
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${filter === f ? 'bg-emerald-600 text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
          <div className="bg-gray-50 p-4 rounded-full mb-4">
            <ShoppingCart className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">No Orders Found</h3>
          <p className="text-gray-500 text-sm max-w-sm">
            {filter === 'All' ? "You haven't received any orders yet." : `No orders with status '${filter}'.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex flex-col md:flex-row md:justify-between md:items-center gap-4 bg-gray-50/50">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-bold text-gray-900">Order #{order.id.slice(-6).toUpperCase()}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      ['Pending'].includes(order.status) ? 'bg-orange-100 text-orange-700' :
                      ['Accepted', 'Preparing', 'Ready', 'Dispatched'].includes(order.status) ? 'bg-blue-100 text-blue-700' :
                      order.status === 'Delivered' ? 'bg-emerald-100 text-emerald-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {order.status || 'Pending'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                  </p>
                </div>
                
                <div className="text-left md:text-right">
                  <p className="text-sm text-gray-500 mb-1">Total Amount</p>
                  <p className="text-lg font-bold text-emerald-600">₹{order.totalAmount}</p>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Customer Details</h4>
                    <p className="font-medium text-gray-900">{order.customerName}</p>
                    <p className="text-sm text-gray-600">{order.customerPhone}</p>
                    <p className="text-sm text-gray-600 mt-1">{order.deliveryAddress}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Payment Info</h4>
                    <p className="font-medium text-gray-900">{order.paymentMethod || 'COD'}</p>
                    <p className="text-sm text-gray-600">{order.paymentStatus || 'Pending'}</p>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-4">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Order Items</h4>
                  <div className="space-y-3">
                    {(order.items || []).map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-3">
                          <span className="font-medium text-gray-900">{item.quantity}x</span>
                          <span className="text-gray-600">{item.name}</span>
                        </div>
                        <span className="font-medium text-gray-900">₹{item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex flex-wrap gap-2">
                {order.status === 'Pending' && (
                  <>
                    <button onClick={() => updateOrderStatus(order.id, 'Accepted', order.customerId)} className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-emerald-700 transition">Accept Order</button>
                    <button onClick={() => updateOrderStatus(order.id, 'Cancelled', order.customerId)} className="bg-white border border-red-200 text-red-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-50 transition">Reject</button>
                  </>
                )}
                {order.status === 'Accepted' && (
                  <button onClick={() => updateOrderStatus(order.id, 'Preparing', order.customerId)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition">Mark as Preparing</button>
                )}
                {order.status === 'Preparing' && (
                  <button onClick={() => updateOrderStatus(order.id, 'Ready', order.customerId)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition">Mark as Ready</button>
                )}
                {order.status === 'Ready' && (
                  <button onClick={() => updateOrderStatus(order.id, 'Dispatched', order.customerId)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 transition">Dispatch Order</button>
                )}
                {order.status === 'Dispatched' && (
                  <button onClick={() => updateOrderStatus(order.id, 'Delivered', order.customerId)} className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-emerald-700 transition">Mark Delivered</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
