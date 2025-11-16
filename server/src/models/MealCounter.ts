import mongoose, { Schema, Document } from 'mongoose';

export interface IMealCounter extends Document {
  category: 'lunch' | 'dinner' | 'dinner-meals';
  date: Date;
  orderCount: number;
  maxOrders?: number; // Optional limit to prevent excessive orders
  createdAt: Date;
  updatedAt: Date;
}

const MealCounterSchema = new Schema<IMealCounter>(
  {
    category: {
      type: String,
      enum: ['lunch', 'dinner', 'dinner-meals'],
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    orderCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    maxOrders: {
      type: Number,
      min: 1,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure uniqueness per category and date
MealCounterSchema.index({ category: 1, date: 1 }, { unique: true });

export default mongoose.model<IMealCounter>('MealCounter', MealCounterSchema);

