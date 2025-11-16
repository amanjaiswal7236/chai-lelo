import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { getCurrentOrder, Order } from '../api/orders';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const OrderTrackingPage = () => {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCurrentOrder();
  }, []);

  const loadCurrentOrder = async () => {
    try {
      setLoading(true);
      const data = await getCurrentOrder();
      setOrder(data);
    } catch (error) {
      toast.error('Failed to load order');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'in-transit':
        return 'bg-blue-100 text-blue-800';
      case 'packed':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-purple-100 text-purple-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <div className="text-xl">Loading...</div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">No Active Order</h2>
            <p className="text-gray-600">You don't have any active orders at the moment.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Order Tracking</h1>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-semibold mb-2">Order #{order._id.slice(-8)}</h2>
              <p className="text-gray-600">
                Placed on {format(new Date(order.createdAt), 'MMM dd, yyyy hh:mm a')}
              </p>
            </div>
            <span className={`px-4 py-2 rounded-lg font-semibold ${getStatusColor(order.status)}`}>
              {order.status.toUpperCase()}
            </span>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Order Items</h3>
            {order.items.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center mb-3">
                <div>
                  <p className="font-semibold">{item.name} × {item.quantity}</p>
                  {item.addOns && item.addOns.length > 0 && (
                    <p className="text-sm text-gray-600">
                      Add-ons: {item.addOns.map((a) => a.name).join(', ')}
                    </p>
                  )}
                </div>
                <p className="font-semibold">₹{item.price * item.quantity}</p>
              </div>
            ))}
          </div>

          <div className="border-t pt-6 mt-6">
            <div className="flex justify-between text-xl font-bold">
              <span>Total Amount</span>
              <span className="text-primary-600">₹{order.totalAmount}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Order Status</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Payment Status</span>
              <span className={order.paymentStatus ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                {order.paymentStatus ? '✅ Paid' : '❌ Pending'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Packed</span>
              <span className={order.packed ? 'text-green-600 font-semibold' : 'text-gray-600'}>
                {order.packed ? '✅ Yes' : '⏳ No'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Delivered</span>
              <span className={order.delivered ? 'text-green-600 font-semibold' : 'text-gray-600'}>
                {order.delivered ? '✅ Yes' : '⏳ No'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-2">Delivery Details</h3>
          <p className="text-gray-600">Location: {order.location}</p>
          <p className="text-gray-600">Phone: {order.userPhone}</p>
        </div>
      </div>
    </div>
  );
};

export default OrderTrackingPage;

