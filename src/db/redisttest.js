import { RedisClient } from './reddis.js';

async function testRedis() {
  try {
    const testUid = 'USR0-001A-328815'; // Postman wale user ka UID yahan dalo
    const token = await RedisClient.get(`session:${testUid}`);
    const ttl = await RedisClient.ttl(`session:${testUid}`);

    console.log('--- Redis Test Result ---');
    console.log('Token:', token || 'No token found');
    console.log('TTL (Seconds):', ttl);

    process.exit(0);
  } catch (error) {
    console.error('Error fetching from Redis:', error);
    process.exit(1);
  }
}

testRedis();