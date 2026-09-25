import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

// Default to localhost for host machine dev, or 'redis' if specified in Compose
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

console.log('Connecting to Redis at:', redisUrl);

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