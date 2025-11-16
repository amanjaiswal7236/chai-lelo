import mongoose, { Schema, Document } from 'mongoose';

export interface IOrderItem {
  itemId: mongoose.Types.ObjectId;
  name: string;
  quantity: number;
  price: number;
  isVeg: boolean;
  addOns?: Array<{
    name: string;
    price: number;
  }>;
}

export interface IOrder extends Document {
  user: mongoose.Types.ObjectId;
  userName: string;
  userPhone: string;
  location: string;
  items: IOrderItem[];
  mealType: 'lunch' | 'dinner' | 'dinner-meals';
  orderDate: Date;
  totalAmount: number;
  paymentStatus: boolean;
  paymentId?: string;
  packed: boolean;
  delivered: boolean;
  status: 'pending' | 'accepted' | 'packed' | 'in-transit' | 'delivered' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>({
  itemId: {
    type: Schema.Types.ObjectId,
    ref: 'MenuItem',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  price: {
    type: Number,
    required: true,
  },
  isVeg: {
    type: Boolean,
    required: true,
  },
  addOns: {
    type: [
      {
        name: String,
        price: Number,
      },
    ],
    default: [],
  },
});

const OrderSchema = new Schema<IOrder>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    userPhone: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    items: {
      type: [OrderItemSchema],
      required: true,
    },
    mealType: {
      type: String,
      enum: ['lunch', 'dinner', 'dinner-meals'],
      required: true,
    },
    orderDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentStatus: {
      type: Boolean,
      default: false,
    },
    paymentId: {
      type: String,
    },
    packed: {
      type: Boolean,
      default: false,
    },
    delivered: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'packed', 'in-transit', 'delivered', 'cancelled'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
OrderSchema.index({ user: 1, orderDate: -1 });
OrderSchema.index({ orderDate: -1 });
OrderSchema.index({ mealType: 1, orderDate: -1 });

export default mongoose.model<IOrder>('Order', OrderSchema);

