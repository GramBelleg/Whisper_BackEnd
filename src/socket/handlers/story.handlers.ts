import { Socket } from "socket.io";
import { getContacts } from "@services/story/story.service";
import { archiveStory } from "@services/story/story.service";
import { sendToClient } from "@socket/utils/socket.utils";
import redisClient from "@src/redis/redis.client";
import { SaveableStory } from "@models/story.models";
import * as userServices from "@services/user/user.service";
import { Privacy, Story } from "@prisma/client";

const stroyParticipants = async (story: Story, clients: Map<number, Socket>): Promise<number[]> => {
    try {
        const privacy: Privacy = story.privacy;
        let participants: number[] = [];
        switch (privacy) {
            case "Everyone":
                participants = Array.from(clients.keys());
                break;
            case "Contact":
                participants = await getContacts(story.userId);
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
    userId: number,
    clients: Map<number, Socket>,
    emitEvent: string,
    emitMessage: any
): Promise<void> => {
    try {
        const participants = await stroyParticipants(emitMessage, clients);
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
        const participants = await stroyParticipants(emitStory, clients);
        for (const participant of participants) {
            sendToClient(participant, clients, emitEvent, {
                id: emitStory.id,
                userId: emitStory.userId,
                content: emitStory.content,
                media: emitStory.media,
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
        const value = await redisClient.get(key); // Wait for Redis to return the value
        if (!value) return;
        const story: Story = JSON.parse(value);
        await redisClient.del(key); //delete the key from redis
        await archiveStory(story.userId, story.id); //database operation
        const participants = await stroyParticipants(story, clients);
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
        const participants = await stroyParticipants(deletedStory, clients);
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
    userId: number,
    clients: Map<number, Socket>,
    emitEvent: string,
    data: any
): Promise<void> => {
    try {
        sendToClient(userId, clients, emitEvent, {
            userId: data.userId,
            storyId: data.storyId,
            userName: data.userName,
            profilePic: data.profilePic,
        });
    } catch (error: any) {
        throw new Error(`Error in likeStory: ${error.message}`);
    }
};

const viewStory = async (
    userId: number,
    clients: Map<number, Socket>,
    emitEvent: string,
    data: any
): Promise<void> => {
    try {
        sendToClient(userId, clients, emitEvent, {
            userId: data.userId,
            storyId: data.storyId,
            userName: data.userName,
            profilePic: data.profilePic,
        });
    } catch (error: any) {
        throw new Error(`Error in viewStory: ${error.message}`);
    }
};

export { broadCast, notifyExpiry, postStory, deleteStory, likeStory, viewStory };
