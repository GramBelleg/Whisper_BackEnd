import { createChat, getChat } from "@services/chat/chat.service";
import { ChatSummary, CreatedChat } from "@models/chat.models";

export const handleCreateChat = async (userId: number, chat: CreatedChat, users: number[]) => {
    try {
        const result = await createChat(users, userId, chat.senderKey, chat.type); //should only accept "DM"
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
