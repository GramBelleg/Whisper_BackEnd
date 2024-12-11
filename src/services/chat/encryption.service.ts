import db from "@DB";
import { getOtherUserId } from "@services/chat/chat.service";

export const createUserKey = async (userId: number, key: string): Promise<number> => {
    const result = await db.publicKey.create({
        data: {
            userId,
            key,
        },
    });
    return result.id;
};

export const userOwnsKey = async (userId: number, keyId: number): Promise<boolean> => {
    const result = await db.publicKey.findUnique({
        where: { id: keyId },
    });
    if (!result) return false;
    return result.userId === userId;
};

export const getUserKey = async (keyId: number): Promise<string> => {
    const result = await db.publicKey.findUnique({
        where: { id: keyId },
    });
    if (!result) return "";
    return result.key;
};

export const associateParticipantKey = async (
    userId: number,
    chatId: number,
    keyId: number
): Promise<void> => {
    await db.chatParticipant.update({
        where: {
            chatId_userId: { chatId, userId },
        },
        data: {
            keyId,
        },
    });
};

export const getOtherUserKey = async (excludedUserId: number, chatId: number): Promise<string> => {
    const otherUserId = await getOtherUserId(excludedUserId, chatId);
    if (!otherUserId) return "";
    const result = await db.chatParticipant.findUnique({
        where: {
            chatId_userId: { chatId, userId: otherUserId },
        },
        select: {
            publicKey: {
                select: {
                    key: true,
                },
            },
        },
    });
    if (!result || !result.publicKey) return "";
    return result.publicKey.key;
};
