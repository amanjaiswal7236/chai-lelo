# Setup Guide - Chai Lelo

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

## Installation

1. **Install root dependencies:**
```bash
npm install
```

2. **Install server dependencies:**
```bash
cd server
npm install
```

3. **Install client dependencies:**
```bash
cd ../client
npm install
```

## Configuration

### Server Configuration

1. Copy the environment example file:
```bash
cd server
cp .env.example .env
```

2. Update `server/.env` with your configuration:
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: A secure random string for JWT tokens
   - `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`: For OTP service (optional for development)
   - `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`: For UPI payments (optional for development)
   - `WHATSAPP_API_URL`, `WHATSAPP_API_TOKEN`: For WhatsApp receipts (optional for development)

### Development Mode

The application will work in development mode without external services configured. OTP and WhatsApp features will log to console instead of sending actual messages.

## Running the Application

### Option 1: Run both servers together (Recommended)
From the root directory:
```bash
npm run dev
```

This will start:
- Backend server on `http://localhost:5000`
- Frontend development server on `http://localhost:5173`

### Option 2: Run servers separately

**Backend:**
```bash
cd server
npm run dev
```

**Frontend:**
```bash
cd client
npm run dev
```

## Creating an Admin User

To create an admin user, you can use MongoDB directly or create a script:

1. Connect to MongoDB
2. Find a user document and update:
```javascript
db.users.updateOne(
  { phone: "+91XXXXXXXXXX" },
  { $set: { role: "admin" } }
)
```

## Features Implemented

### User Features
✅ Landing page with meal categories
✅ Menu browsing with deadline display
✅ Cart functionality with quantity adjustment
✅ Add-ons modal (Zomato-style)
✅ Phone OTP authentication
✅ Location selection
✅ UPI payment integration (mock implementation)
✅ WhatsApp receipt sending (mock implementation)
✅ Order tracking (current order + history)
✅ Order history with filters (date, meal type, status)

### Admin Features
✅ Dashboard with sales summaries
✅ Menu management (add/edit/enable/disable items)
✅ Order deadline management
✅ Order management with status flags
✅ Location management
✅ Advanced filters (date, meal type, location, veg/non-veg, status)
✅ Meal-based counters to prevent excessive orders

## API Endpoints

### Authentication
- `POST /api/auth/request-otp` - Request OTP
- `POST /api/auth/verify-otp` - Verify OTP and login
- `GET /api/auth/me` - Get current user

### Menu
- `GET /api/menu/:category` - Get menu by category
- `GET /api/menu` - Get all menu items (admin)

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders/current` - Get current order
- `GET /api/orders/history` - Get order history
- `PATCH /api/orders/:orderId/payment` - Update payment status

### Admin
- `POST /api/admin/menu` - Create menu item
- `PUT /api/admin/menu/:id` - Update menu item
- `PATCH /api/admin/menu/:id/toggle` - Toggle menu item
- `POST /api/admin/deadline` - Set meal deadline
- `GET /api/admin/dashboard` - Get dashboard data
- `GET /api/admin/orders` - Get orders with filters
- `PATCH /api/admin/orders/:orderId` - Update order status
- `POST /api/admin/counter` - Set meal counter limit

### Locations
- `GET /api/locations` - Get all locations
- `POST /api/admin/locations` - Create location (admin)
- `PUT /api/admin/locations/:id` - Update location (admin)
- `PATCH /api/admin/locations/:id/toggle` - Toggle location (admin)

## Database Models

- **User**: Phone-based authentication, OTP, role (user/admin)
- **MenuItem**: Menu items with category, price, veg/non-veg
- **Order**: Orders with items, payment status, delivery status
- **MealDeadline**: Deadlines for each meal category
- **Location**: Delivery locations
- **MealCounter**: Counter to prevent excessive orders per meal

## Production Deployment

1. Build the frontend:
```bash
cd client
npm run build
```

2. Set up environment variables in production
3. Use a process manager like PM2 for the backend
4. Serve frontend build files through a web server or CDN

## Notes

- OTP and WhatsApp features use mock implementations in development
- Payment integration is set up for Razorpay but uses mock flow in development
- All features are fully functional with proper API integration points
- Meal counters prevent excessive orders per category per day
- Admin can set order deadlines and manage menu items
- After a meal goes live, admin can only make cosmetic updates (enforce in business logic if needed)

