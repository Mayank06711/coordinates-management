import winstonLogger from "../config/winston.config.js";

const asyncHandler = (fn) => {
  return async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      winstonLogger.error(error.message, { error });
      next(error);
    }
  };
};

export default asyncHandler;
