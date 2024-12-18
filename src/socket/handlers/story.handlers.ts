import { Socket } from "socket.io";
import { archiveStory, getStoryPrivacy, getStoryUserId } from "@services/story/story.service";
import { sendToClient } from "@socket/utils/socket.utils";
import redisClient from "@src/redis/redis.client";
import * as userServices from "@services/user/user.service";
import { Privacy, Story } from "@prisma/client";

const storyParticipants = async (story: any, clients: Map<number, Socket>): Promise<number[]> => {
    try {
        let privacy: Privacy;
        if (!story.privacy) privacy = await getStoryPrivacy(story.id);
        else privacy = story.privacy;

        let participants: number[] = [];
        switch (privacy) {
            case "Everyone":
                participants = Array.from(clients.keys());
                break;
            case "Contacts":
                participants = await userServices.getUserContacts(story.userId);
                break;
            default:
                participants = [story.userId];
                break;
        }
        return participants;
    } catch (error: any) {
        throw new Error(`Error in stroyParticipants: ${error.message}`);
    }
};

const broadCast = async (
    clients: Map<number, Socket>,
    emitEvent: string,
    emitMessage: any
): Promise<void> => {
    try {
        const participants = await storyParticipants(emitMessage, clients);
        if (participants) {
            for (const participant of participants) {
                sendToClient(participant, clients, emitEvent, emitMessage);
            }
        }
    } catch (error: any) {
        throw new Error(`Error in broadCast: ${error.message}`);
    }
};

const postStory = async (
    clients: Map<number, Socket>,
    emitEvent: string,
    emitStory: Story
): Promise<void> => {
    try {
        const participants = await storyParticipants(emitStory, clients);
        for (const participant of participants) {
            sendToClient(participant, clients, emitEvent, {
                id: emitStory.id,
                userId: emitStory.userId,
                content: emitStory.content,
                media: emitStory.media,
                type: emitStory.type,
                date: emitStory.date,
            });
        }
    } catch (error: any) {
        throw new Error(`Error in postStory: ${error.message}`);
    }
};

const notifyExpiry = async (key: string, clients: Map<number, Socket>): Promise<void> => {
    try {
        const match = key.match(/\d+/);
        if (!match) return;
        key = key.replace("storyExpired", "storyId");
        const value = await redisClient.getInstance().get(key); // Wait for Redis to return the value
        if (!value) return;
        const story: Story = JSON.parse(value);
        await redisClient.getInstance().del(key); //delete the key from redis
        await archiveStory(story.userId, story.id); //database operation
        const participants = await storyParticipants(story, clients);
        for (const participant of participants) {
            sendToClient(participant, clients, "storyExpired", { storyId: story.id });
        }
    } catch (error: any) {
        throw new Error(`Error in notifyExpiry: ${error.message}`);
    }
};

const deleteStory = async (
    clients: Map<number, Socket>,
    emitEvent: string,
    deletedStory: Story
): Promise<void> => {
    try {
        const participants = await storyParticipants(deletedStory, clients);
        for (const participant of participants) {
            sendToClient(participant, clients, emitEvent, {
                storyId: deletedStory.id,
                userId: deletedStory.userId,
            });
        }
    } catch (error: any) {
        throw new Error(`Error in delete story: ${error.message}`);
    }
};

const likeStory = async (
    clients: Map<number, Socket>,
    emitEvent: string,
    data: any
): Promise<void> => {
    try {
        const storyUserId = await getStoryUserId(data.storyId);
        const user = await userServices.displayedUser(data.userId, storyUserId);
        sendToClient(storyUserId, clients, emitEvent, {
            userId: data.userId,
            storyId: data.storyId,
            userName: user.userName,
            profilePic: user.profilePic,
            hasStory: user.hasStory,
            liked: data.liked,
        });
    } catch (error: any) {
        throw new Error(`Error in likeStory: ${error.message}`);
    }
};

const viewStory = async (
    clients: Map<number, Socket>,
    emitEvent: string,
    data: any
): Promise<void> => {
    const storyUserId = await getStoryUserId(data.storyId);
    const user = await userServices.displayedUser(data.userId, storyUserId);
    sendToClient(storyUserId, clients, emitEvent, {
        userId: data.userId,
        storyId: data.storyId,
        userName: user.userName,
        profilePic: user.profilePic,
        hasStory: user.hasStory,
    });
};

export { broadCast, notifyExpiry, postStory, deleteStory, likeStory, viewStory, storyParticipants };
