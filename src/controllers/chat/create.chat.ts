import { createChat, getChat } from "@services/chat/chat.service";
import { createGroup } from "@services/chat/group.service";
import { ChatSummary, CreatedChat } from "@models/chat.models";
import { MAX_GROUP_SIZE } from "@config/constants.config";
import { ChatType } from "@prisma/client";
import { createChannel } from "@services/chat/channel.service";
import { validateChatUserIds } from "@validators/chat";

export const handleCreateChat = async (userId: number, chat: CreatedChat, users: number[]) => {
    validateChatUserIds(userId, users, chat);

    const result = await createChat(users, userId, chat.senderKey, chat.type);

    if (chat.type == ChatType.GROUP)
        await createGroup(result.id, result.participants, chat, userId);
    else if (chat.type == ChatType.CHANNEL)
        await createChannel(result.id, result.participants, chat, userId);

    const chats = await Promise.all(
        users.map(async (user) => {
            return (await getChat(user, result.id)) as ChatSummary;
        })
    );
    return chats;
};
