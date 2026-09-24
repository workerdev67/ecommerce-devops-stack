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

async function checkRedis() {
  try {
    if (!RedisClient.isOpen) {
      await RedisClient.connect();
    }
    console.log('✅ Connected to Render Redis!');

    const keys = await RedisClient.keys('*');
    console.log('\n--- ALL KEYS IN REDIS ---');
    console.log(keys);

    const cacheKey = 'products:aggregated';
    const data = await RedisClient.get(cacheKey);

    if (data) {
      const parsed = JSON.parse(data);
      console.log(`\n--- DATA FOR "${cacheKey}" ---`);
      console.log(`Total Items Saved: ${parsed.length}`);
      console.log('First Item Sample:', parsed[0]);

      const ttl = await RedisClient.ttl(cacheKey);
      console.log(`Time Left Before Expire: ${ttl} seconds`);
    } else {
      console.log(`\n❌ Key "${cacheKey}" not found or expired in Redis.`);
    }

  } catch (error) {
    console.error('Error connecting to Redis:', error);
  } finally {
    process.exit();
  }
}

checkRedis();