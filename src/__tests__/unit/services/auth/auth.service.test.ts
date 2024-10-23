// import { GenericContainer } from "testcontainers";
// import { createClireent } from "redis";
// import bcrypt from "bcrypt";
// import { saveUserData } from "@services/auth/signup.service"; // Import the function to test
// import RedisOperation from "@src/@types/redis.operation";

// describe("saveUserData function", () => {
//     let redisContainer: StartedTestContainer;
//     let redisHost;
//     let redisPort;

//     beforeAll(async () => {
//         // Spin up the Redis container before tests
//         redisContainer = await new GenericContainer("redis").start();
//         redisHost = redisContainer.getHost();
//         redisPort = redisContainer.getMappedPort(6379);

//         // Re-initialize Redis client with the container's connection details
//         await redis.connect({
//             host: redisHost,
//             port: redisPort,
//         });
//     });

//     afterAll(async () => {
//         // Stop the Redis container after all tests
//         await redisContainer.stop();
//     });

//     it("should store user data in Redis with an expiration time", async () => {
//         const email = "testuser@example.com";
//         const userData = {
//             name: "Test User",
//             userName: "testuser",
//             email: email,
//             phoneNumber: "1234567890",
//             password: "testpassword",
//         };

//         // Call the saveUserData function
//         await saveUserData(
//             userData.name,
//             userData.userName,
//             userData.email,
//             userData.phoneNumber,
//             userData.password
//         );

//         // Verify that the data was stored in Redis
//         const storedData = await redis.hgetall(`${RedisOperation.AddNewUser}:${email}`);

//         expect(storedData.name).toEqual(userData.name);
//         expect(storedData.userName).toEqual(userData.userName);
//         expect(storedData.email).toEqual(userData.email);
//         expect(storedData.phoneNumber).toEqual(userData.phoneNumber);
//         // Ensure that the password is hashed
//         expect(bcrypt.compareSync(userData.password, storedData.password)).toBe(true);

//         // Verify the TTL (Time to Live) is set to 3 hours (10800 seconds)
//         const ttl = await redis.ttl(`${RedisOperation.AddNewUser}:${email}`);
//         expect(ttl).toBeGreaterThan(0); // TTL should be greater than 0 if it was set correctly
//         expect(ttl).toBeLessThanOrEqual(10800); // Shouldn't be more than 3 hours
//     });
// });
