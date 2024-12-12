import { createChat, getChat } from "@services/chat/chat.service";
import { createGroup } from "@services/chat/group.service";
import { ChatSummary, CreatedChat } from "@models/chat.models";
import { MAX_GROUP_SIZE } from "@config/constants.config";
import { ChatType } from "@prisma/client";
import { createChannel } from "@services/chat/channel.service";
import { validateChatUserIds } from "@validators/chat";

const isValidSize = (size: number, type: string) => {
    return (
        (size <= MAX_GROUP_SIZE && type == ChatType.GROUP) ||
        (size == 2 && type == ChatType.DM) ||
        (size >= 1 && type == ChatType.CHANNEL)
    );
};

export const handleCreateChat = async (userId: number, newChat: CreatedChat, users: number[]) => {
    validateChatUserIds(userId, users, newChat);

    if (!newChat.type) throw new Error("Missing Chat type");
    if (!newChat.users) throw new Error("Missing Chat participants");
    if (!isValidSize(users.length, newChat.type)) throw new Error("Can't Create Chat invalid size");
    const chat = await createChat(users, userId, newChat.senderKey, newChat.type);
    if (newChat.type == ChatType.GROUP)
        await createGroup(chat.id, chat.participants, newChat, userId);
    else if (newChat.type == ChatType.CHANNEL)
        await createChannel(chat.id, chat.participants, newChat, userId);

    const chats = await Promise.all(
        users.map(async (user) => {
            return (await getChat(user, chat.id)) as ChatSummary;
        })
    );
    return chats;
};
