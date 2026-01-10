import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

const redis = createClient({ url: process.env.REDIS_URL });

console.log('REDIS_URL:', process.env.REDIS_URL);

redis.on('error', (err) => {
  console.error('Redis client error ', err);
});

if (!redis.isOpen) {
  redis
    .connect()
    .then(() => console.log('Redis is connected'))
    .catch(() => {
      console.log('Unknown error stoped redis from connecting');
    });
}

export default redis;
