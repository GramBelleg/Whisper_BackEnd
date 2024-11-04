import { Socket } from "socket.io";
import { getStoryParticipant } from "@services/user/story.service";
import { sendToClient } from "@socket/utils/socket.utils";
import redisClient from "@src/redis/redis.client";
import { SaveableStory } from "@models/story.models";
import * as userServices from "@services/user/user.service";

export const broadCast = async (
    userId: number,
    clients: Map<number, Socket>,
    emitEvent: string,
    emitMessage: any
): Promise<void> => {
    try {
        const participants = await getStoryParticipant(userId);
        if (participants) {
            for (const participant of participants) {
                sendToClient(participant, clients, emitEvent, emitMessage);
            }
        }
    } catch (error: any) {
        throw new Error(`Error in broadCast: ${error.message}`);
    }
};

export const notifyExpiry = async (key: string, clients: Map<number, Socket>): Promise<void> => {
    try {
        const match = key.match(/\d+/);
        if (!match) return;
        key = `storyId:${match[0]}`;
        const value = await redisClient.get(key); // Wait for Redis to return the value
        if (!value) return;
        const story: SaveableStory = JSON.parse(value);
        const savedStory = await userServices.setStory(story); //database operation
        redisClient.del(key); //delete the key from redis
        broadCast(savedStory.userId, clients, "expiredStory", savedStory);
    } catch (error: any) {
        throw new Error(`Error in notifyExpiry: ${error.message}`);
    }
};
