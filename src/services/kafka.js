import kafka from "../config/kafka.config.js";
import winstonLogger from "../config/winston.config.js";

const admin = kafka.admin();

export const connectKafkaAdmin = async () => {
    try {
        console.log("Admin Initializing...");
        await admin.connect();
        winstonLogger.log(`Successfully connected to Kafka server at ${Date.now().toLocaleString()}`)
        console.log("Kafka admin connected successfully.");
    } catch (error) {
        console.error("Error connecting to Kafka admin:", error);
        winstonLogger.error(`Error connecting to Kafka admin: ${error.message}`);
    }
};


export const disconnectAdmin = async () => {
    try {
        console.log("Disconnecting Kafka admin...");
        await admin.disconnect();
        console.log("Kafka admin disconnected successfully.");
    } catch (error) {
        console.error("Error disconnecting Kafka admin:", error);
    }
};


//create new topics
export const createTopic = async (topic) => {
    try {
         await connectKafkaAdmin();
        const result = await admin.createTopics({
            topics: [
                {
                    topic,
                    numPartitions: 1, // Set the number of partitions
                    replicationFactor: 1, // Set the replication factor
                },
            ],
        });
        await disconnectAdmin()
        console.log(`Topic "${topic}" created:`, result);
    } catch (error) {
        disconnectAdmin()
        console.error(`Error creating topic "${topic}":`, error);
        winstonLogger.error(`Error creating topic "${topic}": ${error.message}`);
    }
};

// Function to delete topics
export const deleteTopic = async (topic) => {
    try {
        await connectKafkaAdmin();
        const result = await admin.deleteTopics({
            topics: [topic],
        });
        await disconnectAdmin();
        console.log(`Topic "${topic}" deleted:`, result);
    } catch (error) {
        console.error(`Error deleting topic "${topic}":`, error);
    }
};

// Function to get the list of consumer groups
export const listGroups = async () => {
    try {
        await connectKafkaAdmin();
        const groups = await admin.listGroups();
        console.log("List of consumer groups:", groups);
        await disconnectAdmin();
        return groups;
    } catch (error) {
        disconnectAdmin();
        console.error("Error fetching consumer groups:", error);
    }
};
