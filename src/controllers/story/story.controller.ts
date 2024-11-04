import * as redisService from "@services/user/redis.service";
import * as storyService from "@services/story/story.service";
import { Story } from "@prisma/client";
import * as storyType from "@models/story.models";

const setStory = async (story: storyType.omitId): Promise<Story> => {
    try {
        const createdStory = await storyService.saveStory(story);
        await redisService.cacheStory(createdStory);
        return createdStory;
    } catch (e: any) {
        throw new Error("Failed to create story");
    }
};

const deleteStory = async (userId: number, storyId: number): Promise<Story> => {
    try {
        const deletedStory = await storyService.deleteStory(userId, storyId);
        await redisService.deleteStory(deletedStory.userId, deletedStory.id);
        return deletedStory;
    } catch (e: any) {
        throw new Error("Failed to delete story");
    }
};

const likeStory = async (userId: number, storyId: number): Promise<void> => {
    try {
        const likedStory = await storyService.likeStory(userId, storyId); //userId is the id of the user who liked the story
    } catch (e: any) {
        throw new Error("Failed to like story");
    }
};

const viewStory = async (userId: number, storyId: number): Promise<void> => {
    try {
        const viwedStory = await storyService.viewStory(userId, storyId);
    } catch (e: any) {
        throw new Error("Failed to view story");
    }
};

export { setStory, deleteStory, likeStory, viewStory };
