import * as messageService from "@services/chat/message.service";
import { getChatParticipantsIds, setLastMessage } from "@services/chat/chat.service";
import { saveExpiringMessage } from "@services/chat/redis.service";
import { ReceivedMessage, SentComment, SentMessage } from "@models/messages.models";
import { buildReceivedMessage } from "../messages/format.message";
import { validateChatAndUser } from "@validators/chat";

export const saveComment = async (comment: SentComment, senderId: number) => {
    const savedComment = await messageService.saveComment(comment, senderId);

    const participantsIds: number[] = await getChatParticipantsIds(comment.chatId);

    const time = await messageService.saveCommentStatus(savedComment, senderId, participantsIds);

    const { sentAt, ...commentWithoutTime } = savedComment;
    const userComment = { ...commentWithoutTime, time: sentAt };
    const otherComment = { ...commentWithoutTime, time };

    return [userComment, otherComment];
};

export const handleSaveMessage = async (userId: number, message: SentMessage) => {
    const savedMessage = await messageService.saveMessage(userId, message);
    await setLastMessage(message.chatId, savedMessage.id);
    return savedMessage;
};

export const handleSend = async (
    userId: number,
    message: SentMessage
): Promise<ReceivedMessage[] | null> => {
    if (!(await validateChatAndUser(userId, message.chatId, null))) {
        throw new Error("User can't access this chat");
    }
    const savedMessage = await handleSaveMessage(userId, message);
    if (message.selfDestruct || message.expiresAfter) {
        await saveExpiringMessage(savedMessage.id, savedMessage.expiresAfter);
    }
    const result = await buildReceivedMessage(userId, savedMessage);
    return result;
};

export default handleSend;
