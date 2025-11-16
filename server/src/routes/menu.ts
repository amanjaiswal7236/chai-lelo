import express, { Request, Response } from 'express';
import MenuItem from '../models/Menu.js';
import MealDeadline from '../models/MealDeadline.js';

const router = express.Router();

// Get menu by category
router.get('/:category', async (req: Request, res: Response) => {
  try {
    const { category } = req.params;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const menuItems = await MenuItem.find({
      category,
      isEnabled: true,
    }).sort({ createdAt: -1 });

    const deadline = await MealDeadline.findOne({ category });

    res.json({
      category,
      items: menuItems,
      deadline: deadline
        ? {
            time: deadline.deadline,
            isLive: deadline.isLive,
          }
        : null,
    });
  } catch (error: any) {
    console.error('Error fetching menu:', error);
    res.status(500).json({ message: 'Failed to fetch menu', error: error.message });
  }
});

// Get all menu items (for admin)
router.get('/', async (req: Request, res: Response) => {
  try {
    const menuItems = await MenuItem.find().sort({ category: 1, createdAt: -1 });
    res.json(menuItems);
  } catch (error: any) {
    console.error('Error fetching all menu items:', error);
    res.status(500).json({ message: 'Failed to fetch menu items', error: error.message });
  }
});

export default router;

