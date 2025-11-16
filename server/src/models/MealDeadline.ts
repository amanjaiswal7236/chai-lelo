import mongoose, { Schema, Document } from 'mongoose';

export interface IMealDeadline extends Document {
  category: 'lunch' | 'dinner' | 'dinner-meals';
  deadline: Date;
  date: Date; // The date this deadline applies to
  isLive: boolean; // Whether the meal is currently live
  createdAt: Date;
  updatedAt: Date;
}

const MealDeadlineSchema = new Schema<IMealDeadline>(
  {
    category: {
      type: String,
      enum: ['lunch', 'dinner', 'dinner-meals'],
      required: true,
      unique: true,
    },
    deadline: {
      type: Date,
      required: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    isLive: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IMealDeadline>('MealDeadline', MealDeadlineSchema);

