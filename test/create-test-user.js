import { authService } from './src/app/api/auth/service';

async function createTestUser() {
  try {
    console.log('Creating test user...');
    const user = await authService.createUser({
      username: 'admin',
      email: 'admin@example.com',
      password_hash: 'admin123', // 会在service中哈希
      role: 'admin',
      is_active: 1,
    });
    console.log('Test user created:', user.username);
  } catch (error) {
    console.error('Error creating test user:', error);
  }
}

createTestUser();
