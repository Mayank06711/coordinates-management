import redis from "redis";
import winstonLogger from "./winston.config.js";

console.log(`Redis host: ${process.env.REDIS_HOST}, Redis port: ${process.env.REDIS_PORT}`);
const redisClient = redis.createClient({
  socket: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
  },
});

redisClient.on("error", (error) => {
  winstonLogger.error(`Error connecting to redisClient ${error.message}`);
  // winstonLogger.cons(`Error connecting to redisClient ${error.message}`);
});

redisClient.on("connect", () => {
  winstonLogger.info("Connected to Redis");
});

export default redisClient;