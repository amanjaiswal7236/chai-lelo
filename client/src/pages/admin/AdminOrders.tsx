import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import api from '../../api/client';
import { Order } from '../../api/orders';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [summary, setSummary] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    packed: 0,
    paid: 0,
    delivered: 0,
  });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    date: new Date().toISOString().split('T')[0],
    mealType: '',
    location: '',
    isVeg: '',
    status: '',
  });

  useEffect(() => {
    loadOrders();
  }, [filters]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/orders', {
        params: filters,
      });
      setOrders(response.data.orders);
      setSummary(response.data.summary);
    } catch (error) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (
    orderId: string,
    updates: { packed?: boolean; paymentStatus?: boolean; delivered?: boolean; status?: string }
  ) => {
    try {
      await api.patch(`/admin/orders/${orderId}`, updates);
      toast.success('Order updated');
      loadOrders();
    } catch (error) {
      toast.error('Failed to update order');
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
          <Link
            to="/admin/dashboard"
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
          >
            Back to Dashboard
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Summary</h2>
          <div className="grid grid-cols-5 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{summary.totalOrders}</p>
              <p className="text-sm text-gray-600">Total Orders</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary-600">₹{summary.totalRevenue}</p>
              <p className="text-sm text-gray-600">Revenue</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{summary.paid}</p>
              <p className="text-sm text-gray-600">Paid</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">{summary.packed}</p>
              <p className="text-sm text-gray-600">Packed</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{summary.delivered}</p>
              <p className="text-sm text-gray-600">Delivered</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                value={filters.date}
                onChange={(e) => setFilters({ ...filters, date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Meal Type</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                type="text"
                value={filters.location}
                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                placeholder="Filter by location"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Veg/Non-Veg</label>
              <select
                value={filters.isVeg}
                onChange={(e) => setFilters({ ...filters, isVeg: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
              >
                <option value="">All</option>
                <option value="true">Veg</option>
                <option value="false">Non-Veg</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
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

        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold">Order #{order._id.slice(-8)}</h3>
                  <p className="text-gray-600 text-sm">
                    {format(new Date(order.createdAt), 'MMM dd, yyyy hh:mm a')} • {order.mealType}
                  </p>
                  <p className="text-gray-600 text-sm">
                    {order.userName} • {order.userPhone} • {order.location}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-lg text-sm font-semibold ${
                    order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                    order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {order.status.toUpperCase()}
                  </span>
                  <p className="text-xl font-bold text-primary-600 mt-2">₹{order.totalAmount}</p>
                </div>
              </div>

              <div className="border-t pt-4 mb-4">
                <h4 className="font-semibold mb-2">Items:</h4>
                <div className="space-y-1">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span>
                        {item.name} × {item.quantity}
                        {item.isVeg ? ' 🟢' : ' 🔴'}
                      </span>
                      <span>₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <button
                    onClick={() => handleUpdateStatus(order._id, { paymentStatus: !order.paymentStatus })}
                    className={`px-4 py-2 rounded-lg ${
                      order.paymentStatus
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                    }`}
                  >
                    {order.paymentStatus ? '✅ Paid' : 'Mark Paid'}
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(order._id, { packed: !order.packed })}
                    className={`px-4 py-2 rounded-lg ${
                      order.packed
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                    }`}
                  >
                    {order.packed ? '✅ Packed' : 'Mark Packed'}
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(order._id, { delivered: !order.delivered, status: 'delivered' })}
                    className={`px-4 py-2 rounded-lg ${
                      order.delivered
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                    }`}
                  >
                    {order.delivered ? '✅ Delivered' : 'Mark Delivered'}
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(order._id, { status: 'cancelled' })}
                    className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
                  >
                    Cancel Order
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminOrders;

