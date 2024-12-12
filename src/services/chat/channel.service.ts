import db from "@DB";
import { CreatedChat } from "@models/chat.models";
export const getChannelContent = async (chatId: number) => {
    try {
        const channel = await db.channel.findUnique({
            where: { chatId },
            select: {
                name: true,
                picture: true,
            },
        });
        if (!channel) throw new Error("Group not found.");
        return channel;
    } catch (err: any) {
        if (err.code === "P2025") {
            throw new Error("Group not found for the specified chatId.");
        }
        throw err;
    }
};
export const createChannel = async (
    chatId: number,
    participants: { id: number; userId: number }[],
    channel: CreatedChat,
    userId: number
) => {
    if (!channel.name) throw new Error("Channel name is missing");
    try {
        const chat = await db.channel.create({
            data: {
                chatId,
                picture: channel.picture,
                name: channel.name,
            },
        });
        await createChannelParticipants(participants, userId);
        return chat;
    } catch (err: any) {
        if (err.code === "P2002") {
            throw new Error("Channel with the specified chatId already exists.");
        }
        throw err;
    }
};
const createChannelParticipants = async (
    participants: { id: number; userId: number }[],
    userId: number
) => {
    try {
        const channelParticipantsData = participants.map((participant) => ({
            id: participant.id,
            isAdmin: participant.userId === userId,
        }));

        await db.channelParticipant.createMany({
            data: channelParticipantsData,
        });
    } catch (err: any) {
        throw err;
    }
};
