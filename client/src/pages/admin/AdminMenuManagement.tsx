import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import api from '../../api/client';
import { MenuItem } from '../../api/menu';
import toast from 'react-hot-toast';

const AdminMenuManagement = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    category: 'lunch' as 'lunch' | 'dinner' | 'dinner-meals',
    isVeg: true,
    price: 0,
    subItems: '',
  });
  const [deadlines, setDeadlines] = useState<Record<string, { deadline: string; isLive: boolean }>>({});

  useEffect(() => {
    loadMenuItems();
    loadDeadlines();
  }, []);

  const loadMenuItems = async () => {
    try {
      setLoading(true);
      const response = await api.get('/menu');
      setMenuItems(response.data);
    } catch (error) {
      toast.error('Failed to load menu items');
    } finally {
      setLoading(false);
    }
  };

  const loadDeadlines = async () => {
    // Load deadlines for each category
    const categories = ['lunch', 'dinner', 'dinner-meals'];
    const deadlineData: Record<string, { deadline: string; isLive: boolean }> = {};
    
    for (const category of categories) {
      try {
        const response = await api.get(`/menu/${category}`);
        if (response.data.deadline) {
          deadlineData[category] = {
            deadline: response.data.deadline.time,
            isLive: response.data.deadline.isLive,
          };
        }
      } catch (error) {
        // Ignore errors
      }
    }
    setDeadlines(deadlineData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const subItemsArray = formData.subItems
        ? formData.subItems.split(',').map((s) => s.trim()).filter(Boolean)
        : [];

      if (editingItem) {
        await api.put(`/admin/menu/${editingItem._id}`, {
          ...formData,
          subItems: subItemsArray,
        });
        toast.success('Menu item updated');
      } else {
        await api.post('/admin/menu', {
          ...formData,
          subItems: subItemsArray,
        });
        toast.success('Menu item created');
      }
      setShowModal(false);
      resetForm();
      loadMenuItems();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save menu item');
    }
  };

  const handleToggle = async (item: MenuItem) => {
    try {
      await api.patch(`/admin/menu/${item._id}/toggle`);
      toast.success(`Item ${item.isEnabled ? 'disabled' : 'enabled'}`);
      loadMenuItems();
    } catch (error) {
      toast.error('Failed to toggle item');
    }
  };

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      image: item.image,
      category: item.category,
      isVeg: item.isVeg,
      price: item.price,
      subItems: item.subItems?.join(', ') || '',
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      image: '',
      category: 'lunch',
      isVeg: true,
      price: 0,
      subItems: '',
    });
    setEditingItem(null);
  };

  const handleSetDeadline = async (category: string) => {
    const deadline = prompt(`Enter deadline for ${category} (YYYY-MM-DDTHH:mm):`);
    const isLive = confirm('Is this meal live?');
    
    if (deadline) {
      try {
        await api.post('/admin/deadline', {
          category,
          deadline,
          isLive,
        });
        toast.success('Deadline set');
        loadDeadlines();
      } catch (error) {
        toast.error('Failed to set deadline');
      }
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
          <h1 className="text-3xl font-bold text-gray-900">Menu Management</h1>
          <div className="flex space-x-4">
            <Link
              to="/admin/dashboard"
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
            >
              Back to Dashboard
            </Link>
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
            >
              + Add Item
            </button>
          </div>
        </div>

        <div className="mb-6 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Set Deadlines</h2>
          <div className="grid grid-cols-3 gap-4">
            {['lunch', 'dinner', 'dinner-meals'].map((category) => (
              <div key={category} className="border rounded-lg p-4">
                <h3 className="font-semibold mb-2 capitalize">{category.replace('-', ' ')}</h3>
                {deadlines[category] && (
                  <p className="text-sm text-gray-600 mb-2">
                    Deadline: {new Date(deadlines[category].deadline).toLocaleString()}
                  </p>
                )}
                <button
                  onClick={() => handleSetDeadline(category)}
                  className="text-primary-600 hover:text-primary-700 text-sm"
                >
                  Set Deadline
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item) => (
            <div key={item._id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="relative">
                <img
                  src={item.image || '/placeholder-food.jpg'}
                  alt={item.name}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-2 right-2">
                  {item.isVeg ? (
                    <span className="bg-green-500 text-white px-2 py-1 rounded text-xs">VEG</span>
                  ) : (
                    <span className="bg-red-500 text-white px-2 py-1 rounded text-xs">NON-VEG</span>
                  )}
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-xl font-semibold mb-2">{item.name}</h3>
                <p className="text-gray-600 text-sm mb-2">{item.description}</p>
                <p className="text-lg font-bold text-primary-600 mb-4">₹{item.price}</p>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(item)}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleToggle(item)}
                    className={`flex-1 px-4 py-2 rounded-lg ${
                      item.isEnabled
                        ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    {item.isEnabled ? 'Disable' : 'Enable'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-4">
                {editingItem ? 'Edit Menu Item' : 'Add Menu Item'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
                    rows={3}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                  <input
                    type="url"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
                    >
                      <option value="lunch">Lunch</option>
                      <option value="dinner">Dinner</option>
                      <option value="dinner-meals">Dinner Meals</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.isVeg}
                      onChange={(e) => setFormData({ ...formData, isVeg: e.target.checked })}
                      className="w-5 h-5"
                    />
                    <span className="text-sm font-medium text-gray-700">Vegetarian</span>
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sub-items (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.subItems}
                    onChange={(e) => setFormData({ ...formData, subItems: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
                    placeholder="Rice, Dal, Roti"
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700"
                  >
                    {editingItem ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminMenuManagement;

