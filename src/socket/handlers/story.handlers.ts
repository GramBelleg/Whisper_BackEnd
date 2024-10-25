import { Socket } from "socket.io";
import { getChatId } from "@services/chat/chat.service";
import { handleDeleteMessage } from "@controllers/chat/delete.message";
import { getStoryParticipant } from "@services/chat/chat.service";
import { th } from "@faker-js/faker/.";
import redisClient from "@src/redis/redis.client";
import { SaveableStory } from "@models/story.models";
import * as userServices from "@services/user/user.service";

export const broadCast = async (
    userId: number,
    clients: Map<number, Socket>,
    emitEvent: string,
    emitStory: any,
): Promise<void> => {
    try {
        const participants = await getStoryParticipant (userId);
        if (participants) {
            participants.forEach((participant) => {
                if (clients.has(participant)) {
                    const client = clients.get(participant);
                    if (client) {
                        client.emit(emitEvent, emitStory);
                    }
                }
            });
        }
    } catch (error) {
        console.error(error);
    }
};

export const notifyExpiry = async (key: string, clients: Map<number, Socket>): Promise<void> => {
    const match = key.match(/\d+/);
    if (!match) return;
    key = `storyId:${match[0]}`;
    const value = await redisClient.get(key); // Wait for Redis to return the value
    if(!value) return;
    const story: SaveableStory = JSON.parse(value);
    const savedStory = await userServices.setStory(story); //database operation
    redisClient.del(key); //delete the key from redis
    broadCast(savedStory.userId , clients, "expiredStory", savedStory);
};
