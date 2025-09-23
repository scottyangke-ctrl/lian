import dotenv from 'dotenv';
dotenv.config();

console.log('DATABASE_URL:', process.env.DATABASE_URL);
console.log('DIRECT_URL:', process.env.DIRECT_URL);

import postgres from 'postgres';

async function testConnection() {
  try {
    console.log('Testing database connection...');
    const client = postgres(process.env.DATABASE_URL);
    const result = await client`SELECT 1 as test`;
    console.log('Database connection successful:', result);
    await client.end();
  } catch (error) {
    console.error('Database connection failed:', error);
  }
}

testConnection();
