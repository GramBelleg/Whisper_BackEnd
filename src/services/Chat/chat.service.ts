import db from "@DB";
import { Chat } from "@prisma/client";

export const getChats = async (userId: number) => {
    const chats = await db.chat.findMany({
        where: { participants: { some: { userId } } },
        include: {
            lastMessage: true,
            participants: {
                where: { userId: { not: userId } }, // Exclude the current user
                select: {
                    user: {
                        select: {
                            id: true, // Get othersId (the ID of the other user)
                            userName: true,
                            profilePic: true, // Get the other user's profilePic
                            hasStory: true,
                            lastSeen: true,
                        },
                    },
                    isMuted: true,
                },
            },
        },
        orderBy: {
            lastMessage: { createdAt: "desc" },
        },
    });

    return chats.map((chat) => {
        const otherUser = chat.participants[0]?.user; // Assuming only one other participant
        return {
            id: chat.id,
            lastMessage: chat.lastMessage,
            othersId: otherUser?.id,
            userName: otherUser?.userName,
            story: otherUser?.hasStory,
            profilePic: otherUser?.profilePic,
            lastSeen: otherUser?.lastSeen,
            muted: otherUser?.profilePic,
        };
    });
};

export const getChatId = async (messageId: number): Promise<number | undefined> => {
    const result = await db.message.findUnique({
        where: { id: messageId },
        select: { chatId: true },
    });
    if (result) {
        return result.chatId;
    }
};

export const getChatParticipantsIds = async (chatId: number): Promise<number[]> => {
    const chatParticipants: Array<{ userId: number }> = await db.chatParticipant.findMany({
        where: { chatId },
        select: { userId: true },
    });
    return chatParticipants.map((participant) => participant.userId);
};

export const setLastMessage = async (chatId: number, messageId: number | null): Promise<void> => {
    await db.chat.update({
        where: { id: chatId },
        data: { lastMessageId: messageId },
    });
};

export const setNewLastMessage = async (chatId: number): Promise<number | null> => {
    const lastMessage = await db.message.findFirst({
        where: { chatId },
        orderBy: { createdAt: "desc" },
    });
    const lastMessageId = lastMessage ? lastMessage.id : null;

    await setLastMessage(chatId, lastMessageId);

    return lastMessageId;
};
