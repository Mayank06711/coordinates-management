import mongoose from "mongoose";
import winstonLogger from "../config/winston.config.js";
const connectDb = async (URI) => {
  try {
    const connectionInst = await mongoose.connect(`${URI}/${process.env.DB_NAME}`);
    winstonLogger.info(
      `Connected to MongoDB at ${connectionInst.connection.host}:${connectionInst.connection.port}`
    );
  } catch (error) {
    console.error("Failed to connect to MongoDB", error);
    winstonLogger.error(`Failed to connect to MongoDB: ${error.message}`);
    process.exit(1); // Exit the process with a failure code
  }
};

export default connectDb;
