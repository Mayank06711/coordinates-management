import redis from "redis";
import winstonLogger from "./winston.config";

console.log("hi")
const redisClient = redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
});

redisClient.on("error", (error) => {
  winstonLogger.error(`Error connecting to redisClient ${error.message}`);
  winstonLogger.console(`Error connecting to redisClient ${error.message}`);
});

redisClient.on("connect", () => {
  winstonLogger.info("Connected to Redis");
  winstonLogger.console("Connected to Redis");
});

export default redisClient;