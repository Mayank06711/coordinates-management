import { Kafka } from "kafkajs";

const kafka = new Kafka({
  clientId: 'coordinate-management-service',
  brokers: ["localhost:9092"],
  logLevel: 1, // 1 corresponds to "error" log level in kafkajs
  requestTimeout: 30000,
  connectionTimeout: 30000,
});

export default kafka;