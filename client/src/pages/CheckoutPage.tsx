import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useCartStore } from '../store/cartStore';
import { createOrder, updatePaymentStatus } from '../api/orders';
import { getLocations, Location } from '../api/locations';
import toast from 'react-hot-toast';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { items, mealType, getTotal, clearCart } = useCartStore();
  const [selectedLocation, setSelectedLocation] = useState('');
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);

  useEffect(() => {
    loadLocations();
  }, []);

  const loadLocations = async () => {
    try {
      const data = await getLocations();
      setLocations(data);
      if (data.length > 0) {
        setSelectedLocation(data[0].name);
      }
    } catch (error) {
      toast.error('Failed to load locations');
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedLocation) {
      toast.error('Please select a location');
      return;
    }

    if (!mealType) {
      toast.error('Please select a meal type');
      return;
    }

    try {
      setLoading(true);
      const order = await createOrder({
        items: items.map((item) => ({
          itemId: item.itemId,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          isVeg: item.isVeg,
          addOns: item.addOns,
        })),
        mealType,
        location: selectedLocation,
      });

      toast.success('Order placed successfully!');
      clearCart();
      navigate('/orders/current');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  const handleUPIPayment = async () => {
    // Mock UPI payment flow
    // In production, integrate with Razorpay or similar payment gateway
    try {
      setPaymentLoading(true);
      
      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      // After successful payment, update order status
      toast.success('Payment successful!');
      
      // In real implementation, you would:
      // 1. Create order first
      // 2. Initiate payment
      // 3. On payment success, update order payment status
      // 4. Send WhatsApp receipt
      
      await handlePlaceOrder();
    } catch (error) {
      toast.error('Payment failed');
    } finally {
      setPaymentLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              {items.map((item) => (
                <div key={item.itemId} className="flex justify-between items-center mb-3 pb-3 border-b">
                  <div>
                    <p className="font-semibold">{item.name} × {item.quantity}</p>
                    {item.addOns && item.addOns.length > 0 && (
                      <p className="text-sm text-gray-600">
                        Add-ons: {item.addOns.map((a) => a.name).join(', ')}
                      </p>
                    )}
                  </div>
                  <p className="font-semibold">
                    ₹{(item.price * item.quantity) +
                      (item.addOns?.reduce((sum, a) => sum + a.price, 0) || 0)}
                  </p>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Delivery Location</h2>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
              >
                {locations.map((loc) => (
                  <option key={loc._id} value={loc.name}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <h2 className="text-xl font-semibold mb-4">Payment</h2>
              <div className="mb-6">
                <div className="flex justify-between mb-2">
                  <span>Subtotal</span>
                  <span>₹{getTotal()}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Delivery</span>
                  <span>Free</span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between text-xl font-bold">
                    <span>Total</span>
                    <span className="text-primary-600">₹{getTotal()}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleUPIPayment}
                disabled={loading || paymentLoading}
                className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50 mb-3"
              >
                {paymentLoading ? 'Processing Payment...' : 'Pay via UPI'}
              </button>

              <button
                onClick={handlePlaceOrder}
                disabled={loading || paymentLoading}
                className="w-full bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 disabled:opacity-50"
              >
                {loading ? 'Placing Order...' : 'Place Order (Pay Later)'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;

