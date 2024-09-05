import redisClient from "../config/redis.config.js";

export const connectRedis = async () => {
  try {
    console.log("Connecting to Redis Server");
    await redisClient.connect();
  } catch (error) {
    console.log("Error connecting to Redis Server");
  }
};

export const disconnectRedis = async () => {
  try {
    await redisClient.quit(); //close the connection
  } catch (error) {
    console.log("Error disconnecting from Redis Server");
  }
};


export const setCacheOnRedis = async (key, val, exp = 3600) => {
  try {
    const serializedVal = JSON.stringify(val);
    await redisClient.set(key, serializedVal); //set the value of expire in seconds
    await redisClient.expire(key, exp); //expire the key
    console.log(
      `Successfully set key '${key}' with an expiry of ${exp} seconds.`
    );
  } catch (error) {
    console.log("Error setting value on Redis", error);
  }
};

export const setMulCacheValuesOnRedis = async (keyValuePairs) => {
  try {
    const keysVal = Object.entries(keyValuePairs);
    const flatKeyVal = keysVal.flat();
    await redisClient.mSet(flatKeyVal);
    console.log("Successfully set multiple key-value pairs.");
  } catch (error) {
    console.error("Error setting multiple values on Redis:", error);
  }
};


export const getMulCachedValuesFromRedis = async (keys) => {
  try {
    const values = await redisClient.mGet(keys);
    //change to JSON values
    const jsonValues = values.map((value) => {
      try {
        return JSON.parse(value);
      } catch {
        return value; // Return same value as JSON parsing fails so it is same as json
      }
    });
    return jsonValues;
  } catch (error) {
    console.error("Error getting multiple values from Redis:", error.message);
  }
};




// GET a key val
export const getCacheFromRedis = async (key) => {
  try {
    const value = await redisClient.get(key);
    return JSON.parse(value);
  } catch (error) {
    console.log("Error getting value from Redis");
    return null;
  }
};


// key should be passes as array of string 
export const deleteMultipleOrSingleKeysFromRedis = async (keys) => {
    try {
      await redisClient.del(keys);
      console.log(`Successfully deleted keys: ${keys.join(', ')}.`);
    } catch (error) {
      console.error("Error deleting multiple keys from Redis:", error);
    }
  };

