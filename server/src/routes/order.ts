import express, { Response } from 'express';
import Order from '../models/Order.js';
import MenuItem from '../models/Menu.js';
import MealCounter from '../models/MealCounter.js';
import MealDeadline from '../models/MealDeadline.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { sendWhatsAppReceipt } from '../utils/whatsapp.js';
import mongoose from 'mongoose';

const router = express.Router();

// Create order
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { items, mealType, location } = req.body;
    const userId = req.userId;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Items are required' });
    }

    if (!mealType || !['lunch', 'dinner', 'dinner-meals'].includes(mealType)) {
      return res.status(400).json({ message: 'Valid meal type is required' });
    }

    if (!location) {
      return res.status(400).json({ message: 'Location is required' });
    }

    // Check deadline
    const deadline = await MealDeadline.findOne({ category: mealType });
    if (deadline && deadline.deadline < new Date()) {
      return res.status(400).json({ message: 'Order deadline has passed' });
    }

    // Check meal counter
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let counter = await MealCounter.findOne({ category: mealType, date: today });

    if (counter && counter.maxOrders && counter.orderCount >= counter.maxOrders) {
      return res.status(400).json({ message: 'Maximum orders reached for this meal' });
    }

    // Validate items and calculate total
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const menuItem = await MenuItem.findById(item.itemId);
      if (!menuItem || !menuItem.isEnabled) {
        return res.status(400).json({ message: `Item ${item.name} is not available` });
      }

      const itemTotal = menuItem.price * item.quantity;
      const addOnsTotal = (item.addOns || []).reduce((sum: number, addon: any) => sum + addon.price, 0);
      totalAmount += itemTotal + addOnsTotal;

      orderItems.push({
        itemId: menuItem._id,
        name: menuItem.name,
        quantity: item.quantity,
        price: menuItem.price,
        isVeg: menuItem.isVeg,
        addOns: item.addOns || [],
      });
    }

    // Get user details
    const User = (await import('../models/User.js')).default;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Create order
    const order = await Order.create({
      user: userId,
      userName: user.name || user.phone,
      userPhone: user.phone,
      location,
      items: orderItems,
      mealType,
      orderDate: today,
      totalAmount,
      status: 'pending',
    });

    // Update counter
    if (!counter) {
      counter = await MealCounter.create({
        category: mealType,
        date: today,
        orderCount: 1,
      });
    } else {
      counter.orderCount += 1;
      await counter.save();
    }

    res.status(201).json({
      message: 'Order created successfully',
      order,
    });
  } catch (error: any) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Failed to create order', error: error.message });
  }
});

// Get current order
router.get('/current', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const order = await Order.findOne({
      user: userId,
      orderDate: { $gte: today },
      status: { $ne: 'delivered' },
    })
      .populate('items.itemId')
      .sort({ createdAt: -1 });

    res.json(order || null);
  } catch (error: any) {
    console.error('Error fetching current order:', error);
    res.status(500).json({ message: 'Failed to fetch current order', error: error.message });
  }
});

// Get order history
router.get('/history', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { date, mealType, status } = req.query;

    const query: any = { user: userId };

    if (date) {
      const filterDate = new Date(date as string);
      filterDate.setHours(0, 0, 0, 0);
      const nextDay = new Date(filterDate);
      nextDay.setDate(nextDay.getDate() + 1);
      query.orderDate = { $gte: filterDate, $lt: nextDay };
    }

    if (mealType) {
      query.mealType = mealType;
    }

    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate('items.itemId')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(orders);
  } catch (error: any) {
    console.error('Error fetching order history:', error);
    res.status(500).json({ message: 'Failed to fetch order history', error: error.message });
  }
});

// Update payment status
router.patch('/:orderId/payment', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { orderId } = req.params;
    const { paymentId, paymentStatus } = req.body;
    const userId = req.userId;

    const order = await Order.findOne({ _id: orderId, user: userId });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.paymentStatus = paymentStatus !== undefined ? paymentStatus : true;
    if (paymentId) order.paymentId = paymentId;
    if (order.paymentStatus) order.status = 'accepted';

    await order.save();

    // Send WhatsApp receipt if payment successful
    if (order.paymentStatus) {
      const orderId = String(order._id);
      await sendWhatsAppReceipt(order.userPhone, {
        orderId,
        items: order.items.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
        totalAmount: order.totalAmount,
        orderDate: order.orderDate,
      });
    }

    res.json({
      message: 'Payment status updated',
      order,
    });
  } catch (error: any) {
    console.error('Error updating payment status:', error);
    res.status(500).json({ message: 'Failed to update payment status', error: error.message });
  }
});

export default router;

