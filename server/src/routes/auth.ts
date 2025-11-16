import express, { Request, Response } from 'express';
import User from '../models/User.js';
import { generateOTP, sendOTP } from '../utils/otp.js';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

const router = express.Router();

// Request OTP
router.post('/request-otp', async (req: Request, res: Response) => {
  try {
    const { phone } = req.body;

    if (!phone || phone.length !== 10) {
      return res.status(400).json({ message: 'Valid 10-digit phone number required' });
    }

    const formattedPhone = `+91${phone}`;
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    let user = await User.findOne({ phone: formattedPhone });

    if (user) {
      user.otp = otp;
      user.otpExpires = otpExpires;
      await user.save();
    } else {
      user = await User.create({
        phone: formattedPhone,
        otp,
        otpExpires,
      });
    }

    await sendOTP(formattedPhone, otp);

    res.json({ message: 'OTP sent successfully' });
  } catch (error: any) {
    console.error('Error requesting OTP:', error);
    res.status(500).json({ message: 'Failed to send OTP', error: error.message });
  }
});

// Verify OTP
router.post('/verify-otp', async (req: Request, res: Response) => {
  try {
    const { phone, otp, name, location } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ message: 'Phone and OTP are required' });
    }

    const formattedPhone = `+91${phone}`;
    const user = await User.findOne({ phone: formattedPhone });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    if (user.otpExpires && user.otpExpires < new Date()) {
      return res.status(400).json({ message: 'OTP expired' });
    }

    // Update user info
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    if (name) user.name = name;
    if (location) user.location = location;
    await user.save();

    // Generate JWT token
    const userId = (user._id as mongoose.Types.ObjectId).toString();
    const jwtSecret = process.env.JWT_SECRET || 'secret';
    const token = jwt.sign(
      { userId, role: user.role },
      jwtSecret,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as jwt.SignOptions
    );

    res.json({
      message: 'OTP verified successfully',
      token,
      user: {
        id: user._id,
        phone: user.phone,
        name: user.name,
        location: user.location,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ message: 'Failed to verify OTP', error: error.message });
  }
});

// Get current user
router.get('/me', async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as {
      userId: string;
    };

    const user = await User.findById(decoded.userId).select('-otp -otpExpires');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      user: {
        id: user._id,
        phone: user.phone,
        name: user.name,
        location: user.location,
        role: user.role,
      },
    });
  } catch (error: any) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

export default router;

