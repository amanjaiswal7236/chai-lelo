import { useState } from 'react';
import { useCartStore } from '../store/cartStore';
import { MenuItem } from '../api/menu';
import toast from 'react-hot-toast';

interface MenuCardProps {
  item: MenuItem;
}

const MenuCard = ({ item }: MenuCardProps) => {
  const [isAdding, setIsAdding] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = async () => {
    setIsAdding(true);
    addItem({
      itemId: item._id,
      name: item.name,
      description: item.description,
      image: item.image,
      price: item.price,
      isVeg: item.isVeg,
    });
    toast.success(`${item.name} added to cart!`);
    setTimeout(() => setIsAdding(false), 300);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 animate-slide-up">
      <div className="relative">
        <img
          src={item.image || '/placeholder-food.jpg'}
          alt={item.name}
          className="w-full h-56 object-cover"
        />
        <div className="absolute top-3 right-3">
          {item.isVeg ? (
            <span className="bg-green-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center space-x-1">
              <span>🟢</span>
              <span>VEG</span>
            </span>
          ) : (
            <span className="bg-red-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center space-x-1">
              <span>🔴</span>
              <span>NON-VEG</span>
            </span>
          )}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
      </div>
      <div className="p-5">
        <h3 className="text-xl font-bold mb-2 text-gray-900">{item.name}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2 min-h-[2.5rem]">{item.description}</p>
        <div className="flex justify-between items-center">
          <div>
            <span className="text-3xl font-extrabold bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">
              ₹{item.price}
            </span>
            <span className="text-gray-500 text-sm ml-1">per plate</span>
          </div>
          <button
            onClick={handleAddToCart}
            disabled={isAdding}
            className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-6 py-2.5 rounded-xl hover:from-primary-600 hover:to-primary-700 font-semibold shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center space-x-2"
          >
            {isAdding ? (
              <>
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Adding...</span>
              </>
            ) : (
              <>
                <span>Add</span>
                <span className="text-lg">+</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MenuCard;

