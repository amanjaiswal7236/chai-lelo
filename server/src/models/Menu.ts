import mongoose, { Schema, Document } from 'mongoose';

export interface IMenuItem extends Document {
  name: string;
  description: string;
  image: string;
  category: 'lunch' | 'dinner' | 'dinner-meals';
  isVeg: boolean;
  price: number;
  subItems?: string[];
  isEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MenuItemSchema = new Schema<IMenuItem>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ['lunch', 'dinner', 'dinner-meals'],
      required: true,
    },
    isVeg: {
      type: Boolean,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    subItems: {
      type: [String],
      default: [],
    },
    isEnabled: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IMenuItem>('MenuItem', MenuItemSchema);

