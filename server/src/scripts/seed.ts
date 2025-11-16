import mongoose from 'mongoose';
import dotenv from 'dotenv';
import MenuItem from '../models/Menu.js';
import Location from '../models/Location.js';
import MealDeadline from '../models/MealDeadline.js';
import User from '../models/User.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/chai-lelo';

const menuItems = [
  // Lunch Items
  {
    name: 'Dal Rice Combo',
    description: 'Delicious dal with steamed rice, pickle, and papad',
    image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800',
    category: 'lunch',
    isVeg: true,
    price: 120,
    subItems: ['Dal', 'Rice', 'Pickle', 'Papad'],
    isEnabled: true,
  },
  {
    name: 'Chicken Biryani',
    description: 'Aromatic basmati rice cooked with tender chicken pieces and spices',
    image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800',
    category: 'lunch',
    isVeg: false,
    price: 180,
    subItems: ['Biryani', 'Raita', 'Salad'],
    isEnabled: true,
  },
  {
    name: 'Veg Thali',
    description: 'Complete vegetarian meal with dal, sabzi, roti, rice, and dessert',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800',
    category: 'lunch',
    isVeg: true,
    price: 150,
    subItems: ['Dal', 'Sabzi', 'Roti', 'Rice', 'Dessert'],
    isEnabled: true,
  },
  {
    name: 'Paneer Butter Masala',
    description: 'Creamy tomato-based curry with soft paneer cubes',
    image: 'https://images.unsplash.com/photo-1563379091339-03246963d4c9?w=800',
    category: 'lunch',
    isVeg: true,
    price: 160,
    subItems: ['Paneer Curry', 'Naan', 'Rice'],
    isEnabled: true,
  },
  {
    name: 'Mutton Curry',
    description: 'Spicy mutton curry cooked with traditional Indian spices',
    image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800',
    category: 'lunch',
    isVeg: false,
    price: 200,
    subItems: ['Mutton Curry', 'Roti', 'Rice'],
    isEnabled: true,
  },

  // Dinner Items
  {
    name: 'Butter Chicken',
    description: 'Creamy tomato-based curry with tender chicken pieces',
    image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800',
    category: 'dinner',
    isVeg: false,
    price: 190,
    subItems: ['Butter Chicken', 'Naan', 'Rice', 'Raita'],
    isEnabled: true,
  },
  {
    name: 'Palak Paneer',
    description: 'Spinach curry with fresh paneer cubes',
    image: 'https://images.unsplash.com/photo-1563379091339-03246963d4c9?w=800',
    category: 'dinner',
    isVeg: true,
    price: 150,
    subItems: ['Palak Paneer', 'Roti', 'Rice'],
    isEnabled: true,
  },
  {
    name: 'Fish Curry',
    description: 'Traditional fish curry with coconut and spices',
    image: 'https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=800',
    category: 'dinner',
    isVeg: false,
    price: 180,
    subItems: ['Fish Curry', 'Rice'],
    isEnabled: true,
  },
  {
    name: 'Chole Bhature',
    description: 'Spicy chickpeas served with fluffy fried bread',
    image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800',
    category: 'dinner',
    isVeg: true,
    price: 140,
    subItems: ['Chole', 'Bhature', 'Onions'],
    isEnabled: true,
  },
  {
    name: 'Egg Curry',
    description: 'Hard-boiled eggs in spicy onion-tomato gravy',
    image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800',
    category: 'dinner',
    isVeg: false,
    price: 130,
    subItems: ['Egg Curry', 'Roti', 'Rice'],
    isEnabled: true,
  },

  // Dinner Meals
  {
    name: 'Complete Dinner Meal',
    description: 'Full dinner with dal, sabzi, roti, rice, salad, and dessert',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800',
    category: 'dinner-meals',
    isVeg: true,
    price: 200,
    subItems: ['Dal', 'Sabzi', 'Roti', 'Rice', 'Salad', 'Dessert'],
    isEnabled: true,
  },
  {
    name: 'Non-Veg Dinner Meal',
    description: 'Complete non-vegetarian dinner with curry, roti, rice, and dessert',
    image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800',
    category: 'dinner-meals',
    isVeg: false,
    price: 250,
    subItems: ['Chicken Curry', 'Roti', 'Rice', 'Salad', 'Dessert'],
    isEnabled: true,
  },
  {
    name: 'Premium Thali',
    description: 'Premium vegetarian thali with multiple dishes and sweets',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800',
    category: 'dinner-meals',
    isVeg: true,
    price: 280,
    subItems: ['Dal', '2 Sabzis', 'Roti', 'Rice', 'Salad', 'Sweet', 'Papad'],
    isEnabled: true,
  },
  {
    name: 'Family Dinner Pack',
    description: 'Complete family dinner pack for 4 people',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800',
    category: 'dinner-meals',
    isVeg: true,
    price: 750,
    subItems: ['Dal', '2 Sabzis', 'Roti (8 pcs)', 'Rice', 'Salad', 'Dessert'],
    isEnabled: true,
  },
];

const locations = [
  {
    name: 'Downtown Office',
    address: '123 Main Street, Downtown',
    isActive: true,
  },
  {
    name: 'Tech Park',
    address: '456 Tech Avenue, Silicon Valley',
    isActive: true,
  },
  {
    name: 'University Campus',
    address: '789 College Road, University Area',
    isActive: true,
  },
  {
    name: 'Residential Area',
    address: '321 Residential Street, Suburb',
    isActive: true,
  },
];

const mealDeadlines = [
  {
    category: 'lunch',
    deadline: new Date(new Date().setHours(11, 0, 0, 0)), // 11 AM today
    date: new Date(),
    isLive: true,
  },
  {
    category: 'dinner',
    deadline: new Date(new Date().setHours(18, 0, 0, 0)), // 6 PM today
    date: new Date(),
    isLive: true,
  },
  {
    category: 'dinner-meals',
    deadline: new Date(new Date().setHours(17, 30, 0, 0)), // 5:30 PM today
    date: new Date(),
    isLive: true,
  },
];

async function seedDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log('Clearing existing data...');
    await MenuItem.deleteMany({});
    await Location.deleteMany({});
    await MealDeadline.deleteMany({});
    console.log('Existing data cleared');

    // Seed Menu Items
    console.log('Seeding menu items...');
    const createdMenuItems = await MenuItem.insertMany(menuItems);
    console.log(`Created ${createdMenuItems.length} menu items`);

    // Seed Locations
    console.log('Seeding locations...');
    const createdLocations = await Location.insertMany(locations);
    console.log(`Created ${createdLocations.length} locations`);

    // Seed Meal Deadlines
    console.log('Seeding meal deadlines...');
    const createdDeadlines = await MealDeadline.insertMany(mealDeadlines);
    console.log(`Created ${createdDeadlines.length} meal deadlines`);

    // Create a sample admin user (optional)
    const adminPhone = '+919876543210'; // Change this to your admin phone
    const existingAdmin = await User.findOne({ phone: adminPhone });
    if (!existingAdmin) {
      const adminUser = await User.create({
        phone: adminPhone,
        name: 'Admin User',
        role: 'admin',
        isVerified: true,
      });
      console.log(`Created admin user: ${adminUser.phone}`);
      console.log('⚠️  Note: Update the admin phone number in seed.ts if needed');
    } else {
      // Update existing user to admin if not already
      if (existingAdmin.role !== 'admin') {
        existingAdmin.role = 'admin';
        await existingAdmin.save();
        console.log(`Updated user ${existingAdmin.phone} to admin`);
      } else {
        console.log(`Admin user already exists: ${existingAdmin.phone}`);
      }
    }

    console.log('\n✅ Database seeding completed successfully!');
    console.log('\nSummary:');
    console.log(`- Menu Items: ${createdMenuItems.length}`);
    console.log(`- Locations: ${createdLocations.length}`);
    console.log(`- Meal Deadlines: ${createdDeadlines.length}`);
    console.log('\nYou can now start using the application!');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();

