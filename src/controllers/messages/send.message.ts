import { saveMessage } from "@services/chat/message.service";
import { getChatType, setLastMessage } from "@services/chat/chat.service";
import { saveExpiringMessage } from "@services/chat/redis.service";
import { ReceivedMessage, SentMessage } from "@models/messages.models";
import { buildReceivedMessage } from "../messages/format.message";
import { getPermissions } from "@services/chat/group.service";

const handleSaveMessage = async (userId: number, message: SentMessage) => {
    const savedMessage = await saveMessage(userId, message);
    await setLastMessage(message.chatId, savedMessage.id);
    return savedMessage;
};
<<<<<<< HEAD
=======
const handleGroupPermissions = async (message: SentMessage) => {
    const permissions = await getPermissions(message.senderId, message.chatId);

    if (!permissions) throw new Error("Couldn't get User Permissions");
    if (!permissions.canPost) throw new Error("You don't have post permission");
};
>>>>>>> main
export const handleSend = async (
    userId: number,
    message: SentMessage
): Promise<ReceivedMessage[] | null> => {
    try {
        const chatType = await getChatType(message.chatId);
        if (chatType == "GROUP") await handleGroupPermissions(message);
        const savedMessage = await handleSaveMessage(userId, message);
        if (message.selfDestruct || message.expiresAfter) {
            await saveExpiringMessage(savedMessage.id, savedMessage.expiresAfter);
        }
        const result = await buildReceivedMessage(userId, savedMessage);
        return result;
    } catch (error) {
        console.error(error);
        return null;
    }
};

export default handleSend;
