import express, { Response } from 'express';
import MenuItem from '../models/Menu.js';
import Order from '../models/Order.js';
import MealDeadline from '../models/MealDeadline.js';
import MealCounter from '../models/MealCounter.js';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication and admin check to all routes
router.use(authenticate);
router.use(requireAdmin);

// Menu Management

// Create menu item
router.post('/menu', async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, image, category, isVeg, price, subItems } = req.body;

    if (!name || !description || !image || !category || isVeg === undefined || !price) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }

    const menuItem = await MenuItem.create({
      name,
      description,
      image,
      category,
      isVeg,
      price,
      subItems: subItems || [],
    });

    res.status(201).json({
      message: 'Menu item created successfully',
      menuItem,
    });
  } catch (error: any) {
    console.error('Error creating menu item:', error);
    res.status(500).json({ message: 'Failed to create menu item', error: error.message });
  }
});

// Update menu item
router.put('/menu/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const menuItem = await MenuItem.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    res.json({
      message: 'Menu item updated successfully',
      menuItem,
    });
  } catch (error: any) {
    console.error('Error updating menu item:', error);
    res.status(500).json({ message: 'Failed to update menu item', error: error.message });
  }
});

// Toggle menu item enabled status
router.patch('/menu/:id/toggle', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const menuItem = await MenuItem.findById(id);

    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    menuItem.isEnabled = !menuItem.isEnabled;
    await menuItem.save();

    res.json({
      message: `Menu item ${menuItem.isEnabled ? 'enabled' : 'disabled'}`,
      menuItem,
    });
  } catch (error: any) {
    console.error('Error toggling menu item:', error);
    res.status(500).json({ message: 'Failed to toggle menu item', error: error.message });
  }
});

// Set meal deadline
router.post('/deadline', async (req: AuthRequest, res: Response) => {
  try {
    const { category, deadline, isLive } = req.body;

    if (!category || !deadline) {
      return res.status(400).json({ message: 'Category and deadline are required' });
    }

    const mealDeadline = await MealDeadline.findOneAndUpdate(
      { category },
      {
        category,
        deadline: new Date(deadline),
        date: new Date(),
        isLive: isLive !== undefined ? isLive : false,
      },
      { upsert: true, new: true }
    );

    res.json({
      message: 'Deadline set successfully',
      deadline: mealDeadline,
    });
  } catch (error: any) {
    console.error('Error setting deadline:', error);
    res.status(500).json({ message: 'Failed to set deadline', error: error.message });
  }
});

// Dashboard - Sales Summary
router.get('/dashboard', async (req: AuthRequest, res: Response) => {
  try {
    const { date } = req.query;
    const filterDate = date ? new Date(date as string) : new Date();
    filterDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(filterDate);
    nextDay.setDate(nextDay.getDate() + 1);

    // Daily sales summary
    const dailyOrders = await Order.find({
      orderDate: { $gte: filterDate, $lt: nextDay },
    });

    const totalRevenue = dailyOrders
      .filter((order) => order.paymentStatus)
      .reduce((sum, order) => sum + order.totalAmount, 0);

    const orderCount = dailyOrders.length;
    const paidOrders = dailyOrders.filter((order) => order.paymentStatus).length;

    // Top selling dishes
    const itemCounts: Record<string, { name: string; count: number; revenue: number }> = {};
    dailyOrders.forEach((order) => {
      order.items.forEach((item) => {
        const key = item.itemId.toString();
        if (!itemCounts[key]) {
          itemCounts[key] = { name: item.name, count: 0, revenue: 0 };
        }
        itemCounts[key].count += item.quantity;
        if (order.paymentStatus) {
          itemCounts[key].revenue += item.price * item.quantity;
        }
      });
    });

    const topDishes = Object.values(itemCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Monthly sales summary
    const startOfMonth = new Date(filterDate.getFullYear(), filterDate.getMonth(), 1);
    const endOfMonth = new Date(filterDate.getFullYear(), filterDate.getMonth() + 1, 0);
    endOfMonth.setHours(23, 59, 59, 999);

    const monthlyOrders = await Order.find({
      orderDate: { $gte: startOfMonth, $lte: endOfMonth },
      paymentStatus: true,
    });

    const monthlyRevenue = monthlyOrders.reduce((sum, order) => sum + order.totalAmount, 0);

    res.json({
      daily: {
        date: filterDate.toISOString().split('T')[0],
        orderCount,
        paidOrders,
        totalRevenue,
        topDishes,
      },
      monthly: {
        month: filterDate.getMonth() + 1,
        year: filterDate.getFullYear(),
        totalRevenue: monthlyRevenue,
        orderCount: monthlyOrders.length,
      },
    });
  } catch (error: any) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ message: 'Failed to fetch dashboard data', error: error.message });
  }
});

// Get orders with filters
router.get('/orders', async (req: AuthRequest, res: Response) => {
  try {
    const { date, mealType, location, isVeg, status } = req.query;

    const query: any = {};

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

    if (location) {
      query.location = location;
    }

    if (status) {
      query.status = status;
    }

    let orders = await Order.find(query)
      .populate('user', 'name phone')
      .sort({ createdAt: -1 })
      .limit(100);

    // Filter by veg/non-veg if specified
    if (isVeg !== undefined) {
      const vegFilter = isVeg === 'true';
      orders = orders.filter((order) =>
        order.items.some((item) => item.isVeg === vegFilter)
      );
    }

    // Calculate summary
    const summary = {
      totalOrders: orders.length,
      totalRevenue: orders
        .filter((order) => order.paymentStatus)
        .reduce((sum, order) => sum + order.totalAmount, 0),
      packed: orders.filter((order) => order.packed).length,
      paid: orders.filter((order) => order.paymentStatus).length,
      delivered: orders.filter((order) => order.delivered).length,
    };

    res.json({
      orders,
      summary,
    });
  } catch (error: any) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Failed to fetch orders', error: error.message });
  }
});

// Update order status
router.patch('/orders/:orderId', async (req: AuthRequest, res: Response) => {
  try {
    const { orderId } = req.params;
    const { packed, paymentStatus, delivered, status } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (packed !== undefined) order.packed = packed;
    if (paymentStatus !== undefined) order.paymentStatus = paymentStatus;
    if (delivered !== undefined) order.delivered = delivered;
    if (status) order.status = status;

    await order.save();

    res.json({
      message: 'Order updated successfully',
      order,
    });
  } catch (error: any) {
    console.error('Error updating order:', error);
    res.status(500).json({ message: 'Failed to update order', error: error.message });
  }
});

// Set meal counter limit
router.post('/counter', async (req: AuthRequest, res: Response) => {
  try {
    const { category, maxOrders, date } = req.body;

    if (!category || !maxOrders) {
      return res.status(400).json({ message: 'Category and maxOrders are required' });
    }

    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);

    const counter = await MealCounter.findOneAndUpdate(
      { category, date: targetDate },
      { maxOrders },
      { upsert: true, new: true }
    );

    res.json({
      message: 'Counter limit set successfully',
      counter,
    });
  } catch (error: any) {
    console.error('Error setting counter limit:', error);
    res.status(500).json({ message: 'Failed to set counter limit', error: error.message });
  }
});

export default router;

