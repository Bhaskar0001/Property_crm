import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { UserModel, IUser } from '../models/User';
import { UnauthorizedError, ValidationError, NotFoundError, AppError } from '../utils/errors';
import { logger } from '../utils/logger';

export class AuthService {
  // Hash password using argon2
  async hashPassword(password: string): Promise<string> {
    return argon2.hash(password);
  }

  // Verify password
  async verifyPassword(hash: string, password: string): Promise<boolean> {
    return argon2.verify(hash, password);
  }

  // Generate access token
  generateAccessToken(userId: string, role: string): string {
    return jwt.sign(
      { userId, role },
      config.jwt.secret,
      { expiresIn: config.jwt.expiry as any }
    );
  }

  // Generate refresh token
  generateRefreshToken(userId: string): string {
    return jwt.sign(
      { userId, type: 'refresh' },
      config.jwt.refreshSecret,
      { expiresIn: config.jwt.refreshExpiry as any }
    );
  }

  // Login
  async login(email: string, password: string): Promise<{
    user: IUser;
    accessToken: string;
    refreshToken: string;
  }> {
    const user = await UserModel.findOne({ email: email.toLowerCase() })
      .select('+passwordHash +refreshToken');

    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    if (!user.isActive) {
      throw new UnauthorizedError('Account is deactivated. Contact admin.');
    }

    const isValid = await this.verifyPassword(user.passwordHash, password);
    if (!isValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const accessToken = this.generateAccessToken(user._id.toString(), user.role);
    const refreshToken = this.generateRefreshToken(user._id.toString());

    // Store refresh token and update last login
    user.refreshToken = refreshToken;
    user.lastLogin = new Date();
    await user.save();

    return { user, accessToken, refreshToken };
  }

  // Refresh token
  async refreshToken(token: string): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    try {
      const decoded = jwt.verify(token, config.jwt.refreshSecret) as {
        userId: string;
        type: string;
      };

      if (decoded.type !== 'refresh') {
        throw new UnauthorizedError('Invalid token type');
      }

      const user = await UserModel.findById(decoded.userId).select('+refreshToken');

      if (!user || !user.isActive) {
        throw new UnauthorizedError('User not found or inactive');
      }

      if (user.refreshToken !== token) {
        // Token reuse detected - invalidate all tokens
        user.refreshToken = undefined;
        await user.save();
        throw new UnauthorizedError('Token reuse detected. Please login again.');
      }

      const newAccessToken = this.generateAccessToken(user._id.toString(), user.role);
      const newRefreshToken = this.generateRefreshToken(user._id.toString());

      user.refreshToken = newRefreshToken;
      await user.save();

      return { accessToken: newAccessToken, refreshToken: newRefreshToken };
    } catch (error) {
      if (error instanceof UnauthorizedError) throw error;
      throw new UnauthorizedError('Invalid or expired refresh token');
    }
  }

  // Logout
  async logout(userId: string): Promise<void> {
    await UserModel.findByIdAndUpdate(userId, { $unset: { refreshToken: 1 } });
  }

  // Change password
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    if (newPassword.length < 8) {
      throw new ValidationError('Password must be at least 8 characters');
    }

    const user = await UserModel.findById(userId).select('+passwordHash');
    if (!user) {
      throw new NotFoundError('User');
    }

    const isValid = await this.verifyPassword(user.passwordHash, currentPassword);
    if (!isValid) {
      throw new UnauthorizedError('Current password is incorrect');
    }

    user.passwordHash = await this.hashPassword(newPassword);
    user.mustChangePassword = false;
    user.refreshToken = undefined;
    await user.save();
  }

  // Bootstrap initial admin
  async bootstrapAdmin(): Promise<void> {
    const { email, password } = config.initialAdmin;

    if (!email || !password) {
      logger.warn('No initial admin credentials configured. Skipping bootstrap.');
      return;
    }

    const existingAdmin = await UserModel.findOne({ role: 'admin' });
    if (existingAdmin) {
      logger.info('Admin account already exists. Skipping bootstrap.');
      return;
    }

    const passwordHash = await this.hashPassword(password);

    await UserModel.create({
      email: email.toLowerCase(),
      name: 'System Admin',
      role: 'admin',
      passwordHash,
      isActive: true,
      mustChangePassword: true,
      permissions: [],
      countryAccess: [],
      propertyTypeAccess: [],
      featureAccess: [],
      propertyAccessScope: { type: 'all' },
    });

    logger.info(`Initial admin account created: ${email}`);
  }

  // Get current user profile
  async getProfile(userId: string): Promise<IUser> {
    const user = await UserModel.findById(userId).select('-__v');
    if (!user) {
      throw new NotFoundError('User');
    }
    return user;
  }
}

export const authService = new AuthService();
