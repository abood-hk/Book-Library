import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

const redis = createClient({
  url: process.env.REDIS_URL,
  socket: {
    connectTimeout: 10000,
    reconnectStrategy: (retries) => {
      if (retries > 10) return new Error('Redis retry limit reached');
      return Math.min(retries * 200, 3000);
    },
  },
});

redis.on('connect', () => console.log('Redis connecting...'));
redis.on('ready', () => console.log('Redis ready'));
redis.on('reconnecting', () => console.log('Redis reconnecting...'));
redis.on('error', (err) => console.error('Redis client error', err.message));

(async () => {
  try {
    await redis.connect();
    console.log('Redis is connected');
  } catch (err) {
    console.error('Redis failed to connect', err);
  }
})();

export default redis;
