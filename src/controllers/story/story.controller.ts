import * as redisService from "@services/user/redis.service";
import * as storyService from "@services/story/story.service";
import { Privacy, Story } from "@prisma/client";
import * as storyType from "@models/story.models";
import { Request, Response } from "express";
import HttpError from "@src/errors/HttpError";
import * as userServices from "@services/user/user.service";

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
    const deletedStory = await storyService.deleteStory(userId, storyId);
    await redisService.deleteStory(deletedStory.userId, deletedStory.id);
    return deletedStory;
};

const likeStory = async (userId: number, storyId: number, liked: boolean): Promise<void> => {
    const likedStory = await storyService.likeStory(userId, storyId, liked); //userId is the id of the user who liked the story
};

const viewStory = async (userId: number, storyId: number): Promise<void> => {
    const viwedStory = await storyService.viewStory(userId, storyId);
};
const changeStoryPrivacy = async (req: Request, res: Response) => {
    const privacyValue = req.body.privacy;
    const storyId = parseInt(req.params.storyId);
    if (!privacyValue) throw new HttpError("Privacy not specified", 404);
    if (!storyId) throw new HttpError("Story not specified", 404);

    if (!(privacyValue in Privacy)) throw new HttpError("Invalid privacy setting", 400);
    const privacy: Privacy = privacyValue;

    await storyService.changeStoryPrivacy(storyId, privacy);
    res.status(200).json({
        status: "success",
        message: "Story Privacy updated.",
    });
};
export { setStory, deleteStory, likeStory, viewStory, changeStoryPrivacy };
