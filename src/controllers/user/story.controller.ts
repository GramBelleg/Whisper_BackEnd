import { Request, Response } from "express";
import * as userServices from "@services/user/user.service";
import * as storyService from "@services/redis/story.service";
import { Story } from "@prisma/client";
import * as storyTypes from "@models/story.models";

const setStory = async (story: storyTypes.omitId): Promise <storyTypes.omitId> => {
        //await userServices.setStory(id, content, media);
        try {
            // const createdStory = await userServices.setStory(story);
            const createdStory: storyTypes.omitId = await storyService.saveStory(story); //redis
            return createdStory;
        }
        catch (e: any) {
            throw new Error("Failed to create story");
        }
};

const deleteStory = async (storyId: number) => {
    try {
        await storyService.deleteStory(storyId);
        return storyId;
    } catch (error) {
        console.error("Error deleting story");
    }
};



export { setStory, deleteStory };