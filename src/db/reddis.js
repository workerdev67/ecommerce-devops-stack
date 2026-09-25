import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

console.log('Connecting to Redis at:', redisUrl);

const isTls = redisUrl.startsWith('rediss://');

const RedisClient = createClient({
  url: redisUrl,
  socket: isTls
    ? {
        tls: true,
        rejectUnauthorized: false
      }
    : undefined
});

RedisClient.on('error', (err) => {
  console.error('❌ Redis Client Error:', err);
});

RedisClient.on('connect', () => {
  console.log('⚡ Connected to Redis Cache');
});

await RedisClient.connect();

export { RedisClient };