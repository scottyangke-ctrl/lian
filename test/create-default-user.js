import dotenv from 'dotenv';
import { authService } from './src/app/api/auth/service.ts';

dotenv.config();

async function createDefaultUser() {
  try {
    const username = process.env.USER;
    const password = process.env.PASSWORD;

    if (!username || !password) {
      console.error('USER and PASSWORD must be set in .env file');
      process.exit(1);
    }

    console.log('Creating default user...');

    // Check if user already exists
    const existingUser = await authService.getUserByUsername(username);
    if (existingUser) {
      console.log('User already exists:', existingUser.username);
      return;
    }

    // Create the user
    const user = await authService.createUser({
      username,
      email: `${username}@local.dev`, // Default email
      password_hash: password, // Will be hashed in createUser
      role: 'admin',
      is_active: 1,
    });

    console.log('Default user created successfully:', user.username);
  } catch (error) {
    console.error('Error creating default user:', error);
    process.exit(1);
  }
}

createDefaultUser();
