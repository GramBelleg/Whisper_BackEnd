import { createChat, getChat, createGroup } from "@services/chat/chat.service";
import { ChatSummary, CreatedChat } from "@models/chat.models";
import { newChat } from "@models/chat.models";

export const handleCreateChat = async (userId: number, chat: CreatedChat, users: number[]) => {
    try {
        const result = await createChat(users, userId, chat.senderKey, chat.type);
        const chats = await Promise.all(
            users.map(async (user) => {
                return (await getChat(user, result.id)) as ChatSummary;
            })
        );
        return chats;
    } catch (error) {
        console.error(error);
        return null;
    }
};

export const handleCreateChat = async (userId: number, newChat: newChat) => {
    if (!newChat.name) throw new Error("Missing Chat Name");

    if (!newChat.type) throw new Error("Missing Chat type");

    if (!newChat.participants) throw new Error("Missing Chat participants");

    const { chatId, participants } = await createChat(newChat.participants, newChat.type);
    if (newChat.type == "GROUP") await createGroup(chatId, participants, newChat, userId);

    return chatId;
};
