import FirebaseAdmin from "@src/FCM/admin";
import {
    findDeviceTokens,
    findUnperviewedMessageUsers,
    findUserIdsByUsernames,
    findUnmutedUsers,
    findChatName
} from "@src/services/notifications/prisma/find.service";
import { getChatType } from "@services/chat/chat.service";
import { ChatType } from "@prisma/client";
import HttpError from "@src/errors/HttpError";

export const pushMessageNotification = async (
    userId: number,
    receivers: number[],
    chatId: number,
    message: any,
): Promise<void> => {
    try {
        let repliedUserId: number | undefined = undefined;
        let mentionedUsers: number[] = [];
        const chatType = await getChatType(chatId);
        const unpreviwedMessageUsers = await findUnperviewedMessageUsers(receivers);
        if (message.parentMessage && receivers.includes(message.parentMessage.senderId) && message.parentMessage.senderId !== userId) {
            repliedUserId = message.parentMessage.senderId;
            receivers = receivers.filter((receiver) => receiver !== repliedUserId);
        }
        if (message.mentions && message.mentions.length > 0) {
            mentionedUsers = await findUserIdsByUsernames(message.mentions);
            receivers = receivers.filter((receiver) => !mentionedUsers.includes(receiver));
            mentionedUsers = mentionedUsers.filter((mentionedUser) => mentionedUser !== userId);
        }
        const { groupName, channelName } = await findChatName(chatId, chatType);
        const unmutedUsers = await findUnmutedUsers(receivers, chatId, chatType);
        const payload = await handleNotificationPayload(message, chatType, groupName, channelName);
        if (repliedUserId) {
            await handleReplyNotification(structuredClone(payload), repliedUserId, unpreviwedMessageUsers);
        }
        if (mentionedUsers.length > 0) {
            await handleMentionNotification(structuredClone(payload), mentionedUsers, unpreviwedMessageUsers);
        }
        if (unmutedUsers.length === 0) return;
        const deviceTokens = await findDeviceTokens(unmutedUsers);
        for (let i = 0; i < unmutedUsers.length; i++) {
            const copyPayload = structuredClone(payload);
            const userDeviceTokens = [] as string[];
            deviceTokens.forEach((deviceToken) => {
                if (deviceToken.userId === unmutedUsers[i] && deviceToken.deviceToken) {
                    userDeviceTokens.push(deviceToken.deviceToken);
                }
            });
            if (userDeviceTokens.length === 0) continue;
            if (unpreviwedMessageUsers.includes(unmutedUsers[i])) {
                copyPayload.notification.body = "New Message";
            }
            await FirebaseAdmin.getInstance().messaging().sendEachForMulticast({
                tokens: userDeviceTokens,
                notification: copyPayload.notification,
                data: copyPayload.data,
            });
        }
    } catch (error: any) {
        throw new HttpError(`Error in pushNotification`, 500);
    }
};

export const handleNotificationPayload = async (
    message: any,
    chatType: ChatType,
    groupName: string | undefined,
    channelName: string | undefined
) => {
    const payload = {
        notification: {
            title: message.sender.userName,
            body: message.content,
        },
        data: {
            type: "new_message",
            message_type: "Decrypted Message",
            messageId: message.id.toString(),
        },
    };
    if (message.type !== 'TEXT') {
        payload.notification.body = message.type + '\n' + message.content;
    }
    if (chatType === ChatType.DM) {
        if (message.isSecret)
            payload.notification.body = "New Message";
        else
            payload.data.message_type = "Encrypted Message";
    } else if (chatType === ChatType.GROUP) {
        payload.notification.title = groupName;
    } else {
        payload.notification.title = channelName;
    }
    return payload;
}

export const handleReplyNotification = async (
    payload: Record<string, any>,
    receiver: number,
    unpreviwedMessageUsers: number[]
) => {
    try {
        const deviceTokens = await findDeviceTokens([receiver]);
        const deviceTokenList = [] as string[];
        deviceTokens.forEach((deviceToken) => {
            if (deviceToken.deviceToken) {
                deviceTokenList.push(deviceToken.deviceToken);
            }
        });
        if (deviceTokenList.length === 0) return;
        if (unpreviwedMessageUsers.includes(receiver)) {
            payload.notification.body = "New Message";
        }
        await FirebaseAdmin.getInstance().messaging().sendEachForMulticast({
            tokens: deviceTokenList,
            notification: payload.notification,
            data: payload.data,
        });
    } catch (error: any) {
        throw new HttpError(`Error in handleReplyNotification`, 500);
    }
}

export const handleMentionNotification = async (
    payload: Record<string, any>,
    receivers: number[],
    unpreviwedMessageUsers: number[]
) => {
    try {
        const deviceTokens = await findDeviceTokens(receivers);
        for (let i = 0; i < receivers.length; i++) {
            const copyPayload = structuredClone(payload);
            const deviceTokenList = [] as string[];
            deviceTokens.forEach((deviceToken) => {
                if (deviceToken.userId === receivers[i] && deviceToken.deviceToken) {
                    deviceTokenList.push(deviceToken.deviceToken);
                }
            });
            if (deviceTokenList.length === 0) continue;
            if (unpreviwedMessageUsers.includes(receivers[i])) {
                copyPayload.notification.body = "New Message";
            }
            await FirebaseAdmin.getInstance().messaging().sendEachForMulticast({
                tokens: deviceTokenList,
                notification: copyPayload.notification,
                data: copyPayload.data,
            });
        }
    } catch (error: any) {
        throw new HttpError(`Error in handleMentionNotification`, 500);
    }
}

export const clearMessageNotification = async (
    userId: number,
    messageIds: number[]
): Promise<void> => {
    try {
        const deviceTokens = await findDeviceTokens([userId]);
        const deviceTokenList = [] as string[];
        deviceTokens.forEach((deviceToken) => {
            if (deviceToken.deviceToken) {
                deviceTokenList.push(deviceToken.deviceToken);
            }
        });
        if (deviceTokenList.length === 0) return;
        for (const messageId of messageIds) {
            const payload = {
                data: {
                    type: "clear_message",
                    messageId: messageId.toString(),
                },
            };
            await FirebaseAdmin.getInstance().messaging().sendEachForMulticast({
                tokens: deviceTokenList,
                data: payload.data,
            });
        }
    } catch (error: any) {
        throw new HttpError(`Error in clearNotification`, 500);
    }
};

export const pushVoiceNofication = async (
    participants: number[],
    tokens: string[],
    notification: any
): Promise<void> => {
    try {
        const deviceTokens = await findDeviceTokens(participants);
        for (let i = 0; i < participants.length; i++) {
            const userDeviceTokens = [] as string[];
            deviceTokens.forEach((deviceToken) => {
                if (deviceToken.userId === participants[i] && deviceToken.deviceToken) {
                    userDeviceTokens.push(deviceToken.deviceToken);
                }
            });
            if (userDeviceTokens.length === 0) continue;
            const payload = {
                notification: {
                    title: "Voice Call",
                    body: "Incoming Call",
                },
                data: {
                    type: "voice_call",
                    token: tokens[i],
                    ...notification,
                },
            };
            if (userDeviceTokens.length === 0) continue;
            await FirebaseAdmin.getInstance().messaging().sendEachForMulticast({
                tokens: userDeviceTokens,
                notification: payload.notification,
                data: payload.data,
            });
        }
    } catch (err: any) {
        throw new HttpError(`Error in pushNotification`, 500);
    }
};
