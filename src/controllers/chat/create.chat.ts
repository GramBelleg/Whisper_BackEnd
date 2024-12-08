import { createChat, getChat } from "@services/chat/chat.service";
import { ChatSummary, CreatedChat } from "@models/chat.models";
import { validateChatUserIds } from "@validators/chat";

export const handleCreateChat = async (userId: number, chat: CreatedChat, users: number[]) => {
    try {
        validateChatUserIds(userId, users, chat);
        const result = await createChat(users, userId, chat.senderKey, chat.type);
        const chats = await Promise.all(
            users.map(async (user) => {
                return (await getChat(user, result.id)) as ChatSummary;
            })
        );
        return chats;
    } catch (error: any) {
        console.error(error.message);
        return null;
    }
};
