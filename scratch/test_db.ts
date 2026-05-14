import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../backend/.env') });

async function testConnection() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

  try {
    console.log('Attempting to connect to database...');
    console.log('URL:', process.env.DATABASE_URL);
    await prisma.$connect();
    console.log('Successfully connected to the database!');
    
    const userCount = await prisma.user.count();
    console.log('User count:', userCount);
    
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@mail.com' }
    });
    console.log('Admin user exists:', !!adminUser);
    
  } catch (error) {
    console.error('Database connection failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
