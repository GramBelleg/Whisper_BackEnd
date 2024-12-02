const redis = require("./src/redis/redis.client").default;
const redisSubscriber = require("./src/redis/redis.subscriber").default;

module.exports = async () => {
    try {
        console.log("Tearing down Redis connections...");
        await redis.quit();
        await redisSubscriber.quit();
        console.log("Redis connections closed successfully.");
    } catch (error) {
        console.error("Error during global teardown:", error);
    }
};
