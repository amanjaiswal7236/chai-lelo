import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import AddOnsModal from '../components/AddOnsModal';
import { useCartStore, CartItem } from '../store/cartStore';
import toast from 'react-hot-toast';

const CartPage = () => {
  const navigate = useNavigate();
  const { items, updateQuantity, removeItem, getTotal, mealType } = useCartStore();
  const [selectedItem, setSelectedItem] = useState<CartItem | null>(null);
  const [showAddOnsModal, setShowAddOnsModal] = useState(false);

  const handleProceed = () => {
    if (items.length === 0) {
      toast.error('Cart is empty');
      return;
    }

    if (!mealType) {
      toast.error('Please select a meal type');
      return;
    }

    // Show add-ons modal for first item, then proceed to checkout
    if (items.length > 0) {
      setSelectedItem(items[0]);
      setShowAddOnsModal(true);
    }
  };

  const handleAddOnsComplete = () => {
    setShowAddOnsModal(false);
    navigate('/checkout');
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center animate-fade-in">
            <div className="text-8xl mb-6">🛒</div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Your Cart is Empty</h2>
            <p className="text-xl text-gray-600 mb-8">Add some delicious items to get started!</p>
            <button
              onClick={() => navigate('/')}
              className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-8 py-4 rounded-xl text-lg font-bold hover:from-primary-600 hover:to-primary-700 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              Browse Menu 🍽️
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-8 animate-fade-in">
          Your <span className="bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">Cart</span>
        </h1>

        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 animate-slide-up">
          {items.map((item) => (
            <div key={item.itemId} className="border-b last:border-b-0 pb-6 mb-6 last:mb-0">
              <div className="flex items-start space-x-4">
                <img
                  src={item.image || '/placeholder-food.jpg'}
                  alt={item.name}
                  className="w-24 h-24 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-xl font-semibold">{item.name}</h3>
                      <p className="text-gray-600 text-sm">{item.description}</p>
                      <div className="mt-2">
                        {item.isVeg ? (
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                            🟢 VEG
                          </span>
                        ) : (
                          <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">
                            🔴 NON-VEG
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => removeItem(item.itemId)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-full transition-colors duration-200"
                      title="Remove item"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {item.addOns && item.addOns.length > 0 && (
                    <div className="mt-2 text-sm text-gray-600">
                      <p className="font-semibold">Add-ons:</p>
                      <ul className="list-disc list-inside">
                        {item.addOns.map((addon, idx) => (
                          <li key={idx}>
                            {addon.name} - ₹{addon.price}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex justify-between items-center mt-4">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => updateQuantity(item.itemId, item.quantity - 1)}
                        className="bg-gray-100 text-gray-700 w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-200 font-bold text-lg transition-all duration-200 hover:scale-110"
                      >
                        −
                      </button>
                      <span className="text-xl font-bold w-10 text-center text-gray-900">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.itemId, item.quantity + 1)}
                        className="bg-primary-100 text-primary-700 w-10 h-10 rounded-full flex items-center justify-center hover:bg-primary-200 font-bold text-lg transition-all duration-200 hover:scale-110"
                      >
                        +
                      </button>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold">
                        ₹{(item.price * item.quantity) +
                          (item.addOns?.reduce((sum, a) => sum + a.price, 0) || 0)}
                      </p>
                      <p className="text-sm text-gray-500">
                        ₹{item.price} × {item.quantity}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-br from-white to-primary-50 rounded-2xl shadow-xl p-6 border-2 border-primary-100 animate-slide-up">
          <div className="flex justify-between items-center mb-6">
            <span className="text-2xl font-bold text-gray-700">Total:</span>
            <span className="text-4xl font-extrabold bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">
              ₹{getTotal()}
            </span>
          </div>
          <button
            onClick={handleProceed}
            className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white py-4 rounded-xl text-lg font-bold hover:from-primary-600 hover:to-primary-700 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
          >
            Proceed to Checkout →
          </button>
        </div>

        {showAddOnsModal && selectedItem && (
          <AddOnsModal
            item={selectedItem}
            onClose={() => setShowAddOnsModal(false)}
            onProceed={handleAddOnsComplete}
          />
        )}
      </div>
    </div>
  );
};

export default CartPage;

