import dotenv from "dotenv"
import app from "./app.js";
import conncetDb from "./db/index.js"
import {createFakeCustomer} from "./helper/faker.js"
import { disconnectAdmin } from "./services/kafka.js";
import { connectRedis } from "./services/redis.js";
dotenv.config({
    path: "./.env",
})

conncetDb(process.env.MONGODB_URI)
.then(async()=>{
  app.listen(process.env.PORT||9991, ()=>{
  console.log(`Server is running on port: ${process.env.PORT}`)
  });
  // await connectRedis();
})
.catch(
  (err)=>{console.log("Mongo DB connection failed !! " + err)}
)

process.on('SIGINT', async () => {
  console.log("Gracefully shutting down...");
 try {
   await disconnectAdmin();

 } catch (error) {
   console.error(`Error disconnecting admin from Kafka: ${error.message}`);
 }
  process.exit();
});