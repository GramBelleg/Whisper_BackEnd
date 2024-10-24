import db from "@DB";
import { Message } from "@prisma/client";
import { SaveableMessage } from "@models/chat.models";

export const getMessage = async (messageId: number) => {
    const msg = await db.message.findUnique({
        where: {
            id: messageId,
        },
        include: {
            sender: {
                select: { id: true, profilePic: true, userName: true },
            },
        },
    });
    if (msg)
        return {
            id: msg.id,
            chatId: msg.chatId,
            senderId: msg.senderId,
            content: msg.content,
            createdAt: msg.createdAt,
            forwarded: msg.forwarded,
            pinned: msg.pinned,
            selfDestruct: msg.selfDestruct,
            expiresAfter: msg.expiresAfter,
            type: msg.type,
            parentMessageId: msg.parentMessageId,
            profilePic: msg.sender.profilePic,
            userName: msg.sender.userName,
        };
};

export const getMessages = async (userId: number, chatId: number) => {
    const messages = await db.messageStatus.findMany({
        where: {
            userId,
            message: {
                chatId,
            },
            deleted: false,
        },
        include: {
            message: {
                include: {
                    sender: {
                        select: { id: true, profilePic: true, userName: true },
                    },
                },
            },
        },
        orderBy: {
            message: { createdAt: "asc" },
        },
    });
    console.log(messages);
    // Map the messages to flatten the structure
    return messages.map((msg) => {
        return {
            id: msg.message.id,
            chatId: msg.message.chatId,
            senderId: msg.message.senderId,
            content: msg.message.content,
            createdAt: msg.message.createdAt,
            forwarded: msg.message.forwarded,
            pinned: msg.message.pinned,
            selfDestruct: msg.message.selfDestruct,
            expiresAfter: msg.message.expiresAfter,
            type: msg.message.type,
            parentMessageId: msg.message.parentMessageId,
            profilePic: msg.message.sender.profilePic,
            userName: msg.message.sender.userName,
            read: msg.read,
            delivered: msg.delivered,
            deleted: msg.deleted,
        };
    });
};

export const saveMessage = async (message: SaveableMessage): Promise<Message> => {
    const savedMessage = await db.message.create({
        data: { ...message },
    });
    return savedMessage;
};

export const editMessage = async (id: number, content: string): Promise<Message> => {
    const editedMessage: Message = await db.message.update({
        where: { id },
        data: { content },
    });
    return editedMessage;
};

export const pinMessage = async (id: number): Promise<Message> => {
    const pinnedMessage: Message = await db.message.update({
        where: { id },
        data: { pinned: true },
    });
    return pinnedMessage;
};

export const unpinMessage = async (id: number): Promise<Message> => {
    const unpinnedMessage: Message = await db.message.update({
        where: { id },
        data: { pinned: false },
    });
    return unpinnedMessage;
};

export const deleteMessage = async (id: number): Promise<void> => {
    const message = await db.message.findUnique({
        where: { id },
    });

    if (message) {
        await db.message.delete({
            where: { id },
        });
    }
};
