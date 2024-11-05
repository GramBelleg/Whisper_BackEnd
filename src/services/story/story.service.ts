import db from "@DB";
import { Story, storyView } from "@prisma/client";
import * as storyType from "@models/story.models";
import { tr } from "@faker-js/faker/.";

//TODO: except bloced people !!!!!!!!!!!!

const saveStory = async (story: storyType.omitId): Promise<Story> => {
    try {
        const createdStory: Story = await db.story.create({
            data: {
                ...story,
            },
        });
        return createdStory;
    } catch (e: any) {
        throw new Error("Failed to create story");
    }
};

const archiveStory = async (userId: number, storyId: number): Promise<void> => {
    try {
        const archivedStory: Story = await db.story.update({
            where: {
                id: storyId,
                userId: userId,
            },
            data: {
                isArchived: true,
            },
        });
        if (!archivedStory) throw new Error("Failed to archive story");
    } catch (error: any) {
        throw new Error(`Error in archiveStory: ${error.message}`);
    }
};

const deleteStory = async (userId: number, storyId: number): Promise<Story> => {
    try {
        const deletedStory: Story = await db.story.delete({
            where: {
                id: storyId,
                userId: userId,
            },
        });
        if (!deletedStory) throw new Error("Failed to delete story");
        return deletedStory;
    } catch (error: any) {
        throw new Error(`Error in deleteStory: ${error.message}`);
    }
};

const likeStory = async (userId: number, storyId: number): Promise<storyView> => {
    try {
        // Attempt to update the record
        const likedStory: storyView = await db.storyView.update({
            where: {
                storyId_userId: {
                    storyId,
                    userId,
                },
            },
            data: {
                isLiked: true,
            },
        });
        if (!likedStory) throw new Error("Story not found");
        return likedStory;
    } catch (error: any) {
        // Check if the error indicates that the record does not exist
        throw new Error(`Error in likeStory: ${error.message}`);
    }
};

const getStoryUserId = async (storyId: number): Promise<number> => {
    try {
        const story = await db.story.findUnique({
            where: {
                id: storyId,
            },
            select: {
                userId: true,
            },
        });
        if (!story) throw new Error("Story not found");
        return story.userId;
    } catch (error: any) {
        throw new Error(`Error in getStoryUserId: ${error.message}`);
    }
};

const viewStory = async (userId: number, storyId: number): Promise<storyView> => {
    try {
        const data: storyView = await db.storyView.create({
            data: {
                userId,
                storyId,
            },
        });
        await db.story.update({
            where: {
                id: storyId,
            },
            data: {
                views: {
                    increment: 1,
                },
            },
        });
        return data;
    } catch (error: any) {
        throw new Error(`Error in viewStory: ${error.message}`);
    }
};
export { saveStory, archiveStory, deleteStory, likeStory, getStoryUserId, viewStory };
