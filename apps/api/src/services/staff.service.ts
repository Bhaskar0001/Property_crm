import { UserModel } from '../models/User';
import * as argon2 from 'argon2';

export const staffService = {
  async create(data: any) {
    const existingUser = await UserModel.findOne({ email: data.email });
    if (existingUser) {
      throw new Error('Email already in use');
    }

    const rawPassword = data.password || 'StaffPass123!';
    const passwordHash = await argon2.hash(rawPassword);
    const user = await UserModel.create({
      ...data,
      passwordHash,
      role: data.role || 'staff',
      isActive: data.isActive !== undefined ? data.isActive : true,
    });

    const userObj = user.toObject();
    delete (userObj as any).passwordHash;
    return userObj;
  },

  async getAll(page: number = 1, limit: number = 10, search?: string, team?: string, isActive?: boolean) {
    const query: any = { role: { $in: ['staff', 'admin'] } };
    
    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
      ];
    }
    if (team) query.team = team;
    if (isActive !== undefined) query.isActive = isActive;

    const skip = (page - 1) * limit;
    const [staff, total] = await Promise.all([
      UserModel.find(query, { passwordHash: 0 }).sort({ createdAt: -1 }).skip(skip).limit(limit),
      UserModel.countDocuments(query),
    ]);

    return {
      staff,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  },

  async getById(id: string) {
    const staff = await UserModel.findById(id, { passwordHash: 0 });
    if (!staff) throw new Error('Staff not found');
    return staff;
  },

  async update(id: string, data: any) {
    const staff = await UserModel.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, projection: { passwordHash: 0 } }
    );
    if (!staff) throw new Error('Staff not found');
    return staff;
  },

  async updatePermissions(id: string, permissions: string[], countryAccess: string[], propertyTypeAccess: string[], featureAccess: string[], propertyAccessScope: any) {
    const staff = await UserModel.findByIdAndUpdate(
      id,
      {
        $set: {
          permissions,
          countryAccess,
          propertyTypeAccess,
          featureAccess,
          propertyAccessScope,
        },
      },
      { new: true, projection: { passwordHash: 0 } }
    );
    if (!staff) throw new Error('Staff not found');
    return staff;
  },

  async activate(id: string) {
    const staff = await UserModel.findByIdAndUpdate(
      id,
      { $set: { isActive: true } },
      { new: true, projection: { passwordHash: 0 } }
    );
    if (!staff) throw new Error('Staff not found');
    return staff;
  },

  async deactivate(id: string) {
    const staff = await UserModel.findByIdAndUpdate(
      id,
      { $set: { isActive: false } },
      { new: true, projection: { passwordHash: 0 } }
    );
    if (!staff) throw new Error('Staff not found');
    return staff;
  },

  async resetPassword(id: string, newPassword: string) {
    const passwordHash = await argon2.hash(newPassword);
    const staff = await UserModel.findByIdAndUpdate(
      id,
      { 
        $set: { 
          passwordHash,
          mustChangePassword: true 
        } 
      },
      { new: true, projection: { passwordHash: 0 } }
    );
    if (!staff) throw new Error('Staff not found');
    return staff;
  },

  async delete(id: string) {
    // Soft delete
    return this.deactivate(id);
  },
};
