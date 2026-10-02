import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  name: string;
  phone?: string;
  role: 'admin' | 'staff';
  team?: 'sales' | 'telecaller' | 'marketing' | 'property_operations' | 'other';
  passwordHash: string;
  isActive: boolean;
  mustChangePassword: boolean;
  permissions: string[];
  countryAccess: mongoose.Types.ObjectId[];
  propertyTypeAccess: mongoose.Types.ObjectId[];
  featureAccess: string[];
  propertyAccessScope: {
    type: 'all' | 'countries' | 'cities' | 'property_types' | 'assigned';
    countries?: mongoose.Types.ObjectId[];
    cities?: string[];
    propertyTypes?: mongoose.Types.ObjectId[];
  };
  lastLogin?: Date;
  refreshToken?: string;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ['admin', 'staff'],
      required: true,
      default: 'staff',
    },
    team: {
      type: String,
      enum: ['sales', 'telecaller', 'marketing', 'property_operations', 'other'],
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    mustChangePassword: {
      type: Boolean,
      default: false,
    },
    permissions: {
      type: [String],
      default: [],
    },
    countryAccess: {
      type: [{ type: Schema.Types.ObjectId, ref: 'Country' }],
      default: [],
    },
    propertyTypeAccess: {
      type: [{ type: Schema.Types.ObjectId, ref: 'PropertyType' }],
      default: [],
    },
    featureAccess: {
      type: [String],
      default: [],
    },
    propertyAccessScope: {
      type: {
        type: String,
        enum: ['all', 'countries', 'cities', 'property_types', 'assigned'],
        default: 'all',
      },
      countries: [{ type: Schema.Types.ObjectId, ref: 'Country' }],
      cities: [String],
      propertyTypes: [{ type: Schema.Types.ObjectId, ref: 'PropertyType' }],
    },
    lastLogin: Date,
    refreshToken: {
      type: String,
      select: false,
    },
  },
  {
    timestamps: true,
  },
);

userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ team: 1 });

export const UserModel = mongoose.model<IUser>('User', userSchema);
