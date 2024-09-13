import apiError from "../utils/apiError.js";

const retryOperation = async (operation, retries = +process.env.MAX_RETRIES) => {
    let attempt = 0;
    while (attempt < retries) {
      try {
        return await operation(); // return whatever succeeded operation returns
      } catch (error) {
        attempt++;
        if (attempt >= retries) throw new apiError(500, "operation failed even after maximum retries");
        console.warn(`Retrying due to error: ${error.message}`);
        await new Promise((resolve) => setTimeout(resolve, 2 ** attempt * 1000));//Exponential Backoff:
      }
    }
  };

export default retryOperation;