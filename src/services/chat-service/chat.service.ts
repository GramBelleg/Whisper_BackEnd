import db from "src/prisma/PrismaClient";
import { ChatMessage } from "@prisma/client";
import { SaveableMessage } from "@models/message.models";

export async function saveChatMessage(message: SaveableMessage): Promise<ChatMessage> {
    try {
        const savedMessage = await db.chatMessage.create({
            data: { ...message },
        });
        return savedMessage;
    } catch (error) {
        throw new Error("Error saving chat message: " + error);
    }
}

export async function setLastMessage(chatId: number, messageId: number): Promise<void> {
    try {
        await db.chat.update({
            where: { id: chatId },
            data: { lastMessageId: messageId },
        });
    } catch (error) {
        console.error("Error setting last message:", error);
    }
}

export async function editChatMessage(id: number, content: string): Promise<ChatMessage> {
    try {
        const edittedMessage: ChatMessage = await db.chatMessage.update({
            where: { id },
            data: { content },
        });
        return edittedMessage;
    } catch (error) {
        throw new Error("Error editing chat message: " + error);
    }
}

export async function deleteChatMessage(id: number): Promise<void> {
    try {
        await db.chatMessage.delete({
            where: { id },
        });
    } catch (error) {
        console.error("Error deleting chat message:", error);
    }
}

export async function setNewLastMessage(chatId: number): Promise<number | null> {
    try {
        const lastMessage = await db.chatMessage.findFirst({
            where: { chatId },
            orderBy: { createdAt: "desc" },
        });
        const lastMessageId = lastMessage ? lastMessage.id : null;

        await db.chat.update({
            where: { id: chatId },
            data: { lastMessageId },
        });

        return lastMessageId;
    } catch (error) {
        console.error("Error setting new last message:", error);
        return null;
    }
}
