import db from "@DB";
import { Message } from "@prisma/client";
import { getChatParticipantsIds } from "@services/chat/chat.service";
import {
    DraftMessage,
    MessageReference,
    SavedComment,
    SentComment,
    SentMessage,
} from "@models/messages.models";

export const deleteComments = async (userId: number, ids: number[]) => {
    const parentComments = await db.comment.findMany({
        where: { id: { in: ids } },
        select: { parentCommentId: true },
    });

    const parentCommentIds: number[] = parentComments
        .map((parentComment) => parentComment?.parentCommentId)
        .filter((id): id is number => id !== undefined);

    await db.comment.updateMany({
        where: { id: { in: parentCommentIds } },
        data: {
            replyCount: {
                decrement: 1,
            },
        },
    });
    await db.comment.deleteMany({
        where: {
            id: { in: ids },
        },
    });
};

export const getReplies = async (userId: number, commentId: number) => {
    const comments = await db.commentStatus.findMany({
        where: {
            userId,
            comment: {
                parentCommentId: commentId,
            },
        },
        select: {
            time: true,
            comment: {
                select: {
                    id: true,
                    senderId: true,
                    messageId: true,
                    parentCommentId: true,
                    content: true,
                    replyCount: true,
                },
            },
        },
        orderBy: {
            time: "asc",
        },
    });
    return comments.map((comment) => ({
        ...comment.comment,
        time: comment.time,
    }));
};
export const getComments = async (userId: number, messageId: number) => {
    const comments = await db.commentStatus.findMany({
        where: {
            userId,
            comment: {
                messageId,
                parentCommentId: null,
            },
            deleted: false,
        },
        select: {
            time: true,
            comment: {
                select: {
                    id: true,
                    senderId: true,
                    messageId: true,
                    parentCommentId: true,
                    content: true,
                    replyCount: true,
                },
            },
        },
        orderBy: {
            time: "asc",
        },
    });
    return comments.map((comment) => ({
        ...comment.comment,
        time: comment.time,
    }));
};
export const saveCommentStatus = async (
    comment: SavedComment,
    userId: number,
    participantIds: number[]
) => {
    const time = new Date().toISOString();
    await db.commentStatus.createMany({
        data: participantIds.map((participantId) => ({
            userId: participantId,
            commentId: comment.id,
            time: participantId == userId ? comment.sentAt : time,
        })),
    });
    return time;
};
export const saveComment = async (comment: SentComment, userId: number) => {
    let hasParent = false;
    if (comment.parentCommentId) {
        hasParent = true;
        await db.comment.update({
            where: {
                id: comment.parentCommentId,
            },
            data: {
                replyCount: { increment: 1 },
            },
        });
    }
    const savedComment: SavedComment = await db.comment.create({
        data: {
            senderId: userId,
            messageId: comment.messageId,
            content: comment.content,
            parentCommentId: comment.parentCommentId,
            sentAt: comment.sentAt,
        },
    });
    return savedComment;
};

export const getOtherMessageTime = async (excludeUserId: number, messageId: number) => {
    return await db.messageStatus.findFirst({
        where: { NOT: { userId: excludeUserId }, messageId },
        select: {
            time: true,
        },
    });
};

export const getForwardedFromMessage = async (
    forwarded: boolean,
    forwardedFromUserId: number | null
) => {
    if (!forwarded || !forwardedFromUserId) return null;
    const result = await db.user.findUnique({
        where: { id: forwardedFromUserId },
        select: {
            id: true,
            userName: true,
            profilePic: true,
        },
    });
    if (!result) return null;
    return result;
};

export const getMentions = async (messageId: number) => {
    const result = await db.message.findUnique({
        where: { id: messageId },
        select: {
            mentions: true,
        },
    });
    if (!result) return null;
    const userNames = await db.user.findMany({
        where: {
            id: {
                in: result.mentions,
            },
        },
        select: {
            userName: true,
        },
    });
    return userNames.map((user) => user.userName);
};

export const getParentMessageContent = async (messageId: number) => {
    const result = await db.message.findUnique({
        where: { id: messageId },
        select: {
            parentContent: true,
            parentMedia: true,
            parentExtension: true,
            parentType: true,
        },
    });
    if (!result) return null;
    const {
        parentContent: content,
        parentMedia: media,
        parentExtension: extension,
        parentType: type,
    } = result;
    return { content, media, extension, type };
};

export const getDraftParentMessageContent = async (userId: number, chatId: number) => {
    const result = await db.chatParticipant.findUnique({
        where: { chatId_userId: { userId, chatId } },
        select: {
            draftParentContent: true,
            draftParentMedia: true,
            draftParentExtension: true,
            draftParentType: true,
        },
    });
    if (!result) return null;
    const {
        draftParentContent: content,
        draftParentMedia: media,
        draftParentExtension: extension,
        draftParentType: type,
    } = result;
    return { content, media, extension, type };
};

export const getMessageSummary = async (id: number | null) => {
    if (!id) return null;
    const result = await db.message.findUnique({
        where: { id },
        select: {
            id: true,
            type: true,
            sender: {
                select: {
                    id: true,
                    userName: true,
                    profilePic: true,
                },
            },
        },
    });
    return result;
};

export const getUserMessageTime = async (userId: number, messageId: number) => {
    return await db.messageStatus.findFirst({
        where: { userId, messageId },
        select: {
            time: true,
        },
    });
};

export const getMessage = async (id: number) => {
    return await db.messageStatus.findUnique({
        where: { id },
        select: {
            message: {
                select: {
                    id: true,
                    content: true,
                    media: true,
                    type: true,
                    extension: true,
                    read: true,
                    delivered: true,
                },
            },
            time: true,
        },
    });
};

export const getPinnedMessages = async (chatId: number) => {
    return await db.message.findMany({
        where: {
            chatId,
            pinned: true,
        },
        select: {
            id: true,
            content: true,
        },
    });
};

export const getSingleMessage = async (userId: number, id: number) => {
    return await db.messageStatus.findUnique({
        where: {
            messageId_userId: {
                messageId: id,
                userId: userId,
            },
            deleted: false,
        },
        select: {
            message: true,
        },
    });
};

export const getMessages = async (userId: number, chatId: number) => {
    const messages = await db.messageStatus.findMany({
        where: {
            userId,
            message: {
                chatId,
            },
            deleted: false,
        },
        select: {
            message: true,
        },
        orderBy: {
            time: "asc",
        },
    });

    return messages.map((message) => message.message);
};

export const saveMessageStatuses = async (
    userId: number,
    message: Message,
    participantIds: number[]
) => {
    await db.messageStatus.createMany({
        data: participantIds.map((participantId) => ({
            userId: participantId,
            messageId: message.id,
            time: participantId == userId ? message.sentAt : new Date().toISOString(),
        })),
    });
};

export const getMessageContent = async (messageId: number | null) => {
    if (!messageId) return null;
    const message = await db.message.findUnique({
        where: { id: messageId },
        select: { content: true, media: true, extension: true, type: true },
    });
    return message;
};

export const enrichMessageWithParentContent = async (message: SentMessage) => {
    if (!message.parentMessageId) return message;
    const parentContentAndMedia = await getMessageContent(message.parentMessageId);

    return {
        ...message,
        parentContent: parentContentAndMedia!.content,
        parentMedia: parentContentAndMedia!.media,
        parentExtension: parentContentAndMedia!.extension,
        parentType: parentContentAndMedia!.type,
    };
};

export const saveMessage = async (userId: number, message: SentMessage): Promise<Message> => {
    const messageData = await enrichMessageWithParentContent(message);

    const savedMessage = await db.message.create({
        data: messageData,
    });

    const participantIds = await getChatParticipantsIds(message.chatId);
    await saveMessageStatuses(userId, savedMessage, participantIds);

    return savedMessage;
};

export const editMessage = async (id: number, content: string): Promise<Message> => {
    const editedMessage: Message = await db.message.update({
        where: { id },
        data: { content, edited: true },
    });
    return editedMessage;
};

export const pinMessage = async (id: number): Promise<Message> => {
    const pinnedMessage: Message = await db.message.update({
        where: { id },
        data: { pinned: true },
    });
    return pinnedMessage;
};

export const unpinMessage = async (id: number): Promise<Message> => {
    const unpinnedMessage: Message = await db.message.update({
        where: { id },
        data: { pinned: false },
    });
    return unpinnedMessage;
};

export const deleteMessagesForUser = async (userId: number, Ids: number[]): Promise<void> => {
    const existingMessages = await db.message.findMany({
        where: {
            id: { in: Ids },
        },
        select: { id: true },
    });

    const existingIds = existingMessages.map((message) => message.id);
    if (existingIds.length > 0) {
        await db.messageStatus.updateMany({
            where: {
                messageId: { in: existingIds },
                userId: userId,
            },
            data: { deleted: true },
        });
    }
};

export const deleteMessagesForAll = async (Ids: number[]): Promise<void> => {
    const existingMessages = await db.message.findMany({
        where: {
            id: { in: Ids },
        },
        select: { id: true },
    });

    const existingIds = existingMessages.map((message) => message.id);

    if (existingIds.length > 0) {
        await db.message.deleteMany({
            where: { id: { in: existingIds } },
        });
    }
};

export const getDeliveredUsers = async (userId: number, messageId: number) => {
    return await db.messageStatus.findMany({
        where: {
            messageId,
            NOT: {
                OR: [{ userId }, { delivered: null }],
            },
            read: null,
        },
        select: {
            user: {
                select: {
                    id: true,
                    userName: true,
                    profilePic: true,
                },
            },
            delivered: true,
        },
    });
};

export const getReadUsers = async (userId: number, messageId: number) => {
    return await db.messageStatus.findMany({
        where: {
            messageId,
            NOT: {
                OR: [{ userId }, { read: null }],
            },
        },
        select: {
            user: {
                select: {
                    id: true,
                    userName: true,
                    profilePic: true,
                },
            },
            read: true,
        },
    });
};

export const getMessageStatus = async (userId: number, messageId: number) => {
    const deliveredUsers = await getDeliveredUsers(userId, messageId);
    const readUsers = await getReadUsers(userId, messageId);
    return { deliveredUsers, readUsers };
};

export const updateDeliverMessagesStatuses = async (userId: number) => {
    const result = await db.messageStatus.findMany({
        where: { userId, message: { senderId: { not: userId } }, delivered: null },
        select: {
            message: {
                select: {
                    id: true,
                },
            },
        },
    });
    await db.messageStatus.updateMany({
        where: { userId, message: { senderId: { not: userId } }, delivered: null },
        data: { delivered: new Date().toISOString() },
    });
    return result.map((message) => message.message.id);
};

export const getRecordsToDeliver = async (messageIds: number[]) => {
    return await db.message.findMany({
        where: {
            delivered: false,
            id: { in: messageIds },
        },
        select: {
            id: true,
            senderId: true,
            chatId: true,
        },
    });
};

export const groupMessageRecords = (
    records: { id: number; senderId: number; chatId: number }[]
) => {
    const senderMap = new Map<number, Map<number, { chatId: number; messageIds: number[] }>>();

    for (const record of records) {
        if (!senderMap.has(record.senderId)) {
            senderMap.set(record.senderId, new Map());
        }

        const chatMap = senderMap.get(record.senderId)!;

        if (!chatMap.has(record.chatId)) {
            chatMap.set(record.chatId, { chatId: record.chatId, messageIds: [] });
        }

        chatMap.get(record.chatId)!.messageIds.push(record.id);
    }

    const result: Record<number, { chatId: number; messageIds: number[] }[]> = {};
    for (const [senderId, chatMap] of senderMap.entries()) {
        result[senderId] = Array.from(chatMap.values());
    }

    return result;
};

export const updateDeliveredStatuses = async (messages: MessageReference[]) => {
    await db.message.updateMany({
        where: {
            id: { in: messages.map((message) => message.id) },
        },
        data: { delivered: true },
    });
};

export const updateDeliverMessages = async (messageIds: number[]) => {
    const recordsToDeliver = await getRecordsToDeliver(messageIds);
    const groupedRecords = groupMessageRecords(recordsToDeliver);

    await updateDeliveredStatuses(recordsToDeliver);

    return groupedRecords;
};

export const deliverAllMessages = async (userId: number) => {
    const undeliveredMessages = await updateDeliverMessagesStatuses(userId);
    return await updateDeliverMessages(undeliveredMessages);
};

export const updateDeliverMessageStatus = async (userId: number, messageId: number) => {
    await db.messageStatus.update({
        where: { messageId_userId: { messageId, userId } },
        data: { delivered: new Date().toISOString() },
    });
};

export const updateDeliverMessage = async (messageId: number) => {
    const result = await db.message.findUnique({
        where: { id: messageId, delivered: false },
        select: { id: true, chatId: true, senderId: true },
    });
    if (!result) return;
    await db.message.update({
        where: { id: messageId },
        data: { delivered: true },
    });
    return result;
};

export const deliverMessage = async (userId: number, messageId: number) => {
    await updateDeliverMessageStatus(userId, messageId);
    return await updateDeliverMessage(messageId);
};

export const updateReadMessagesStatuses = async (
    messagesFilter: boolean,
    userId: number,
    messages: number[],
    chatId: number
) => {
    const result = await db.messageStatus.findMany({
        where: {
            userId,
            message: {
                ...(messagesFilter && { id: { in: messages } }),
                senderId: { not: userId },
                chatId,
            },
            read: null,
        },
        select: {
            message: {
                select: {
                    id: true,
                },
            },
        },
    });
    await db.messageStatus.updateMany({
        where: {
            userId,
            message: {
                ...(messagesFilter && { id: { in: messages } }),
                senderId: { not: userId },
                chatId,
            },
            read: null,
        },
        data: { read: new Date().toISOString() },
    });
    return result.map((message) => message.message.id);
};

export const getRecordsToRead = async (messageIds: number[]) => {
    return await db.message.findMany({
        where: {
            read: false,
            id: { in: messageIds },
        },
        select: {
            id: true,
            senderId: true,
            chatId: true,
        },
    });
};

export const updateReadStatuses = async (messages: MessageReference[]) => {
    await db.message.updateMany({
        where: {
            read: false,
            id: { in: messages.map((message) => message.id) },
        },
        data: { read: true },
    });
};

export const updateReadMessages = async (messageIds: number[]) => {
    const recordsToRead = await getRecordsToRead(messageIds);
    const groupedRecords = groupMessageRecords(recordsToRead);

    await updateReadStatuses(recordsToRead);

    return groupedRecords;
};

export const readMessages = async (userId: number, messages: number[], chatId: number) => {
    const unreadMessages = await updateReadMessagesStatuses(true, userId, messages, chatId);
    return await updateReadMessages(unreadMessages);
};

export const readAllMessages = async (userId: number, chatId: number) => {
    const unreadMessages = await updateReadMessagesStatuses(false, userId, [], chatId);
    return await updateReadMessages(unreadMessages);
};

export const enrichDraftWithParentContent = async (message: DraftMessage) => {
    if (!message.draftParentMessageId) return message;

    const parentContentAndMedia = await getMessageContent(message.draftParentMessageId);

    return {
        ...message,
        draftParentContent: parentContentAndMedia!.content,
        draftParentMedia: parentContentAndMedia!.media,
        draftParentExtension: parentContentAndMedia!.extension,
    };
};

export const draftMessage = async (userId: number, chatId: number, message: DraftMessage) => {
    const messageData = await enrichDraftWithParentContent(message);

    await db.chatParticipant.update({
        where: {
            chatId_userId: {
                chatId,
                userId,
            },
        },
        data: {
            ...messageData,
        },
    });
};

export const undraftMessage = async (userId: number, chatId: number) => {
    await db.chatParticipant.update({
        where: {
            chatId_userId: {
                chatId,
                userId,
            },
        },
        data: {
            draftContent: "",
            draftTime: null,
            draftParentMessageId: null,
        },
    });
};

export const getDraftedMessage = async (
    userId: number,
    chatId: number
): Promise<DraftMessage | null> => {
    return await db.chatParticipant.findUnique({
        where: {
            chatId_userId: {
                chatId,
                userId,
            },
        },
        select: {
            draftContent: true,
            draftTime: true,
            draftParentMessageId: true,
        },
    });
};
