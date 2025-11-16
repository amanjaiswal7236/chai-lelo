import express, { Request, Response } from 'express';
import Location from '../models/Location.js';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth.js';

const router = express.Router();

// Get all locations (public)
router.get('/', async (req: Request, res: Response) => {
  try {
    const locations = await Location.find({ isActive: true }).sort({ name: 1 });
    res.json(locations);
  } catch (error: any) {
    console.error('Error fetching locations:', error);
    res.status(500).json({ message: 'Failed to fetch locations', error: error.message });
  }
});

// Admin routes
router.use(authenticate);
router.use(requireAdmin);

// Create location
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { name, address } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Location name is required' });
    }

    const location = await Location.create({
      name,
      address,
    });

    res.status(201).json({
      message: 'Location created successfully',
      location,
    });
  } catch (error: any) {
    console.error('Error creating location:', error);
    res.status(500).json({ message: 'Failed to create location', error: error.message });
  }
});

// Update location
router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const location = await Location.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!location) {
      return res.status(404).json({ message: 'Location not found' });
    }

    res.json({
      message: 'Location updated successfully',
      location,
    });
  } catch (error: any) {
    console.error('Error updating location:', error);
    res.status(500).json({ message: 'Failed to update location', error: error.message });
  }
});

// Toggle location active status
router.patch('/:id/toggle', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const location = await Location.findById(id);

    if (!location) {
      return res.status(404).json({ message: 'Location not found' });
    }

    location.isActive = !location.isActive;
    await location.save();

    res.json({
      message: `Location ${location.isActive ? 'activated' : 'deactivated'}`,
      location,
    });
  } catch (error: any) {
    console.error('Error toggling location:', error);
    res.status(500).json({ message: 'Failed to toggle location', error: error.message });
  }
});

export default router;

