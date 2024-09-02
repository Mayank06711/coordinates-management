import winstonLogger from "../config/winston.config";

const asyncHandler = (fn) => {
  return async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      winstonLogger.error(error.message, { error });
      const statusCode = error.statusCode || 500;
      return res.status(statusCode).send({ message: error.message || 'Internal Server Error' });
    }
  };
};

export default asyncHandler;
