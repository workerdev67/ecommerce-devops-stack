import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

// Fallback logic so it defaults to local Redis if env variable is missing
const redisUrl = process.env.REDDIS_UR || process.env.REDDIS_UR;
console.log(redisUrl);

const RedisClient = createClient({
  url: redisUrl
});

RedisClient.on('error', (err) => {
  console.error('❌ Redis Client Error:', err);
});

RedisClient.on('connect', () => {
  console.log('⚡ Connected to Redis Cache');
});

await RedisClient.connect();

export { RedisClient };