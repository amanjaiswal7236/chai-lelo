import { useState } from 'react';
import { useCartStore, CartItem } from '../store/cartStore';

interface AddOnsModalProps {
  item: CartItem;
  onClose: () => void;
  onProceed: () => void;
}

const ADD_ONS = [
  { name: 'Extra Rice', price: 30 },
  { name: 'Extra Curry', price: 40 },
  { name: 'Papad', price: 10 },
  { name: 'Pickle', price: 15 },
  { name: 'Soft Drink', price: 25 },
  { name: 'Water Bottle', price: 20 },
];

const AddOnsModal = ({ item, onClose, onProceed }: AddOnsModalProps) => {
  const [selectedAddOns, setSelectedAddOns] = useState<Set<string>>(
    new Set(item.addOns?.map((a) => a.name) || [])
  );
  const addAddOn = useCartStore((state) => state.addAddOn);
  const removeAddOn = useCartStore((state) => state.removeAddOn);

  const handleToggleAddOn = (addOnName: string, addOnPrice: number) => {
    if (selectedAddOns.has(addOnName)) {
      selectedAddOns.delete(addOnName);
      removeAddOn(item.itemId, addOnName);
    } else {
      selectedAddOns.add(addOnName);
      addAddOn(item.itemId, { name: addOnName, price: addOnPrice });
    }
    setSelectedAddOns(new Set(selectedAddOns));
  };

  const addOnsTotal = Array.from(selectedAddOns).reduce((sum, name) => {
    const addOn = ADD_ONS.find((a) => a.name === name);
    return sum + (addOn?.price || 0);
  }, 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Add-ons for {item.name}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="space-y-3 mb-4">
          {ADD_ONS.map((addOn) => (
            <label
              key={addOn.name}
              className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
            >
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={selectedAddOns.has(addOn.name)}
                  onChange={() => handleToggleAddOn(addOn.name, addOn.price)}
                  className="w-5 h-5 text-primary-600"
                />
                <span className="font-medium">{addOn.name}</span>
              </div>
              <span className="text-primary-600 font-semibold">₹{addOn.price}</span>
            </label>
          ))}
        </div>

        <div className="border-t pt-4 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold">Add-ons Total:</span>
            <span className="text-xl font-bold text-primary-600">₹{addOnsTotal}</span>
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={onProceed}
            className="flex-1 bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700"
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddOnsModal;

