import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import MenuCard from '../components/MenuCard';
import { getMenuByCategory, MenuItem } from '../api/menu';
import { useCartStore } from '../store/cartStore';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const MenuPage = () => {
  const { category } = useParams<{ category: string }>();
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [deadline, setDeadline] = useState<{ time: string; isLive: boolean } | null>(null);
  const [loading, setLoading] = useState(true);
  const setMealType = useCartStore((state) => state.setMealType);

  useEffect(() => {
    if (category) {
      setMealType(category as 'lunch' | 'dinner' | 'dinner-meals');
      loadMenu();
    }
  }, [category]);

  const loadMenu = async () => {
    try {
      setLoading(true);
      const data = await getMenuByCategory(category!);
      setMenuItems(data.items);
      setDeadline(data.deadline);
    } catch (error: any) {
      toast.error('Failed to load menu');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const formatDeadline = (deadlineTime: string) => {
    try {
      const deadlineDate = new Date(deadlineTime);
      return format(deadlineDate, 'MMM dd, yyyy hh:mm a');
    } catch {
      return deadlineTime;
    }
  };

  const isDeadlinePassed = deadline ? new Date(deadline.time) < new Date() : false;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50">
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <svg className="animate-spin h-12 w-12 text-primary-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-xl text-gray-600 font-medium">Loading delicious menu...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-10 animate-fade-in">
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6 capitalize">
            <span className="bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">
              {category?.replace('-', ' ')}
            </span>{' '}
            Menu
          </h1>
          {deadline && (
            <div className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-primary-500 animate-slide-up">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-gray-500 uppercase tracking-wide mb-1">Order Deadline</p>
                  <p className="text-xl font-bold text-gray-900">
                    {formatDeadline(deadline.time)}
                  </p>
                </div>
                {isDeadlinePassed ? (
                  <span className="bg-red-100 text-red-800 px-5 py-2.5 rounded-xl font-bold text-sm shadow-md">
                    ⏰ Deadline Passed
                  </span>
                ) : deadline.isLive ? (
                  <span className="bg-green-100 text-green-800 px-5 py-2.5 rounded-xl font-bold text-sm shadow-md flex items-center space-x-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    <span>Live Now</span>
                  </span>
                ) : (
                  <span className="bg-yellow-100 text-yellow-800 px-5 py-2.5 rounded-xl font-bold text-sm shadow-md">
                    ⏳ Coming Soon
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {menuItems.length === 0 ? (
          <div className="text-center py-16 animate-fade-in">
            <div className="text-6xl mb-4">🍽️</div>
            <p className="text-2xl text-gray-600 font-semibold mb-2">No items available</p>
            <p className="text-gray-500">Check back soon for delicious meals!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
            {menuItems.map((item, index) => (
              <div key={item._id} style={{ animationDelay: `${index * 50}ms` }}>
                <MenuCard item={item} />
              </div>
            ))}
          </div>
        )}

        <div className="mt-12 text-center animate-fade-in">
          <button
            onClick={() => navigate('/cart')}
            className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-10 py-4 rounded-xl text-lg font-bold hover:from-primary-600 hover:to-primary-700 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
          >
            View Cart 🛒
          </button>
        </div>
      </div>
    </div>
  );
};

export default MenuPage;

