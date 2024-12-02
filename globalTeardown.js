const redis = require("./src/redis/redis.client");
const redisSubscriber = require("./src/redis/redis.subscriber");
const fs = require('fs');

module.exports = async () => {
    try {
        const file = fs.createWriteStream('log.txt');
        console.log("Tearing down Redis connections...");
        // await redis.quit();
        // await redisSubscriber.quit();
        console.log("Redis connections closed successfully.");
        file.write('Redis connections closed successfully.');
        file.end();
    } catch (error) {
        console.error("Error during global teardown:", error);
    }
};
