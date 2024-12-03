import { createChat, getChat, createGroup } from "@services/chat/chat.service";
import { ChatSummary, CreatedChat } from "@models/chat.models";

export const handleCreateChat = async (userId: number, chat: CreatedChat, users: number[]) => {
    try {
        if (!chat.name) throw new Error("Missing Chat Name");

        if (!chat.type) throw new Error("Missing Chat type");

        if (!chat.users) throw new Error("Missing Chat participants");
        const result = await createChat(users, userId, chat.senderKey, chat.type);
        if (chat.type == "GROUP")
            await createGroup(result.chatId, result.participants, chat, userId);

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
