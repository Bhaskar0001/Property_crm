import mongoose from 'mongoose';
import argon2 from 'argon2';
import { config } from '../config';
import { UserModel } from '../models/User';
import { logger } from '../utils/logger';

async function resetAdmin() {
  try {
    logger.info('Connecting to MongoDB...');
    await mongoose.connect(config.mongodb.uri);
    logger.info('Connected to MongoDB.');

    const adminEmail = 'admin@company.com';
    const targetPassword = 'password123';

    const passwordHash = await argon2.hash(targetPassword);

    let user = await UserModel.findOne({ email: adminEmail });
    if (!user) {
      logger.info(`Creating admin user ${adminEmail}...`);
      user = await UserModel.create({
        email: adminEmail,
        name: 'System Admin',
        role: 'admin',
        passwordHash,
        isActive: true,
        mustChangePassword: false,
        permissions: ['*'],
        countryAccess: [],
        propertyTypeAccess: [],
        featureAccess: [],
        propertyAccessScope: { type: 'all' },
      });
      logger.info(`Admin user created: ${adminEmail}`);
    } else {
      logger.info(`Updating existing admin user ${adminEmail}...`);
      user.passwordHash = passwordHash;
      user.isActive = true;
      user.mustChangePassword = false;
      user.role = 'admin';
      await user.save();
      logger.info(`Admin password successfully reset for: ${adminEmail}`);
    }

    console.log('\n======================================================');
    console.log('✅ ADMIN CREDENTIALS READY:');
    console.log(`   Email:    ${adminEmail}`);
    console.log(`   Password: ${targetPassword}`);
    console.log('======================================================\n');
  } catch (error) {
    logger.error({ err: error }, 'Failed to reset admin credentials');
  } finally {
    await mongoose.disconnect();
  }
}

resetAdmin().then(() => process.exit(0));
