import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import api from '../../api/client';
import toast from 'react-hot-toast';

interface DashboardData {
  daily: {
    date: string;
    orderCount: number;
    paidOrders: number;
    totalRevenue: number;
    topDishes: Array<{ name: string; count: number; revenue: number }>;
  };
  monthly: {
    month: number;
    year: number;
    totalRevenue: number;
    orderCount: number;
  };
}

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    loadDashboard();
  }, [selectedDate]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/dashboard', {
        params: { date: selectedDate },
      });
      setDashboardData(response.data);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
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
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <div className="flex space-x-4">
            <Link
              to="/admin/menu"
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
            >
              Manage Menu
            </Link>
            <Link
              to="/admin/orders"
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
            >
              View Orders
            </Link>
            <Link
              to="/admin/locations"
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
            >
              Manage Locations
            </Link>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
          />
        </div>

        {dashboardData && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-gray-600 text-sm font-medium mb-2">Total Orders</h3>
                <p className="text-3xl font-bold text-gray-900">{dashboardData.daily.orderCount}</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-gray-600 text-sm font-medium mb-2">Paid Orders</h3>
                <p className="text-3xl font-bold text-green-600">{dashboardData.daily.paidOrders}</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-gray-600 text-sm font-medium mb-2">Daily Revenue</h3>
                <p className="text-3xl font-bold text-primary-600">₹{dashboardData.daily.totalRevenue}</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-gray-600 text-sm font-medium mb-2">Monthly Revenue</h3>
                <p className="text-3xl font-bold text-primary-600">₹{dashboardData.monthly.totalRevenue}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">Top Selling Dishes</h2>
                <div className="space-y-3">
                  {dashboardData.daily.topDishes.map((dish, idx) => (
                    <div key={idx} className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold">{dish.name}</p>
                        <p className="text-sm text-gray-600">{dish.count} orders</p>
                      </div>
                      <p className="text-lg font-semibold text-primary-600">₹{dish.revenue}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">Monthly Summary</h2>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Month</span>
                    <span className="font-semibold">
                      {new Date(dashboardData.monthly.year, dashboardData.monthly.month - 1).toLocaleString('default', { month: 'long' })} {dashboardData.monthly.year}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Orders</span>
                    <span className="font-semibold">{dashboardData.monthly.orderCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Revenue</span>
                    <span className="font-semibold text-primary-600">₹{dashboardData.monthly.totalRevenue}</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;

