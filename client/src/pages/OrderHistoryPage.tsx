import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { getOrderHistory, Order } from '../api/orders';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const OrderHistoryPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    date: '',
    mealType: '',
    status: '',
  });

  useEffect(() => {
    loadOrderHistory();
  }, [filters]);

  const loadOrderHistory = async () => {
    try {
      setLoading(true);
      const data = await getOrderHistory({
        date: filters.date || undefined,
        mealType: filters.mealType || undefined,
        status: filters.status || undefined,
      });
      setOrders(data);
    } catch (error) {
      toast.error('Failed to load order history');
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Order History</h1>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
              <input
                type="date"
                value={filters.date}
                onChange={(e) => setFilters({ ...filters, date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Meal Type</label>
              <select
                value={filters.mealType}
                onChange={(e) => setFilters({ ...filters, mealType: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
              >
                <option value="">All</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
                <option value="dinner-meals">Dinner Meals</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
              >
                <option value="">All</option>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="packed">Packed</option>
                <option value="in-transit">In Transit</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-xl text-gray-600">No orders found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order._id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold">Order #{order._id.slice(-8)}</h3>
                    <p className="text-gray-600 text-sm">
                      {format(new Date(order.createdAt), 'MMM dd, yyyy hh:mm a')} • {order.mealType}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-lg text-sm font-semibold ${getStatusColor(order.status)}`}>
                      {order.status.toUpperCase()}
                    </span>
                    <p className="text-xl font-bold text-primary-600 mt-2">₹{order.totalAmount}</p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex flex-wrap gap-2 mb-2">
                    {order.items.map((item, idx) => (
                      <span key={idx} className="text-sm text-gray-600">
                        {item.name} × {item.quantity}
                      </span>
                    ))}
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Location: {order.location}</span>
                    <div className="flex space-x-4">
                      <span className={order.paymentStatus ? 'text-green-600' : 'text-red-600'}>
                        Payment: {order.paymentStatus ? '✅' : '❌'}
                      </span>
                      <span className={order.packed ? 'text-green-600' : 'text-gray-600'}>
                        Packed: {order.packed ? '✅' : '⏳'}
                      </span>
                      <span className={order.delivered ? 'text-green-600' : 'text-gray-600'}>
                        Delivered: {order.delivered ? '✅' : '⏳'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistoryPage;

