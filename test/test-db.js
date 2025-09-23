import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('Testing database connection...');
    await prisma.$connect();
    console.log('Database connected successfully');

    // Test creating a log
    console.log('Testing log creation...');
    const testLog = await prisma.strategyLog.create({
      data: {
        strategy_id: 1,
        action: 'test',
        message: 'test message',
        details: {}
      }
    });
    console.log('Log created:', testLog);

    // Clean up
    await prisma.strategyLog.delete({
      where: { id: testLog.id }
    });
    console.log('Test log deleted');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
