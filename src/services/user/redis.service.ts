import redisClient from "@src/redis/redis.client";
import * as storyType from "@models/story.models";
import { Story } from "@prisma/client";

const cacheStory = async (story: Story): Promise<Story> => {
    await redisClient.getInstance().setex(`storyExpired:${story.id}userId:${story.userId}`, 86400, "");  // 86400 seconds = 24 hours
    await redisClient.getInstance().set(`storyId:${story.id}userId:${story.userId}`, JSON.stringify(story));
    return story;
};

const deleteStory = async (userId: number ,storyId: number): Promise<void> => {
    const deletedCount = await redisClient.getInstance().del(`storyId:${storyId}userId:${userId}`, `storyExpired:${storyId}userId:${userId}`);
    if(deletedCount === 0) {
        throw new Error("Story not found");
    }
};

export { cacheStory, deleteStory };