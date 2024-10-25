import redisClient from "@src/redis/redis.client";
import { SaveableStory } from "@models/story.models";
import { Story } from "@prisma/client";

const saveStory = async (story: SaveableStory): Promise<Story> => {
    const id = await redisClient.incr("storyCount");
    await redisClient.setex(`storyExpired:${id}`, 86400, "");  // 86400 seconds = 24 hours
    await redisClient.set(`storyId:${id}`, JSON.stringify(story));
    return {id: id, ...story};
};

const deleteStory = async (storyId: number): Promise<void> => {
    const deletedCount = await redisClient.del(`storyId:${storyId}`, `storyExpired:${storyId}`);
    if(deletedCount === 0) {
        throw new Error("Story not found");
    }
};

export { saveStory, deleteStory };