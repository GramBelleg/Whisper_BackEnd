import { createChat, getChat } from "@services/chat/chat.service";
import { createChannel, createGroup } from "@services/chat/group.service";
import { ChatSummary, CreatedChat } from "@models/chat.models";
import { MAX_GROUP_SIZE } from "@config/constants.config";
import { ChatType } from "@prisma/client";

const isValidSize = (size: number, type: string) => {
    return (
        (size <= MAX_GROUP_SIZE && type == ChatType.GROUP) ||
        (size == 2 && type == ChatType.DM) ||
        (size >= 1 && type == ChatType.CHANNEL)
    );
};
export const handleCreateChat = async (userId: number, chat: CreatedChat, users: number[]) => {
    try {
        if (!chat.type) throw new Error("Missing Chat type");
        if (!chat.users) throw new Error("Missing Chat participants");
        if (!isValidSize(users.length, chat.type))
            throw new Error("Can't Create Chat invalid size");

        const result = await createChat(users, userId, chat.senderKey, chat.type);
        if (chat.type == ChatType.GROUP)
            await createGroup(result.chatId, result.participants, chat, userId);
        else if (chat.type == ChatType.CHANNEL)
            await createChannel(result.chatId, result.participants, chat, userId);
        const chats = await Promise.all(
            users.map(async (user) => {
                return (await getChat(user, result.chatId)) as ChatSummary;
            })
        );
        return chats;
    } catch (error) {
        console.error(error);
        return null;
    }
};
