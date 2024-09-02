import winston from "winston";

// Configure Winston logger
const winstonLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [${level.toUpperCase()}]: ${message}`;
    })
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/success.log', level: 'info' }), // Log successful
    new winston.transports.File({ filename: 'logs/fail.log', level: 'error' }),  // Log failed 
    new winston.transports.Console() // Log to the console as well
  ]
});


export default winstonLogger;