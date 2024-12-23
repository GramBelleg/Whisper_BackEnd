import FirebaseAdmin from "@src/FCM/admin";
import {
    findDeviceTokens,
    findUnperviewedMessageUsers,
    findUserIdsByUsernames,
    findUnmutedUsers,
    findChatName,
} from "@src/services/notifications/prisma/find.service";
import { getChatType } from "@services/chat/chat.service";
import { UserToken } from "@prisma/client";
import { handleNotificationPayload, handleReplyNotification, handleMentionNotification, handleNewActivityUsers } from "@services/notifications/handles.service";

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
        let deviceTokens = await findDeviceTokens(receivers);
        if (message.parentMessage && receivers.includes(message.parentMessage.senderId) && message.parentMessage.senderId !== userId) {
            repliedUserId = message.parentMessage.senderId;
            receivers = receivers.filter((receiver) => receiver !== repliedUserId);
        }
        if (message.mentions && message.mentions.length > 0) {
            message.content = message.content.replace(/@\[[^\]]+\]\(user:\d+\)/g, '').trim();
            mentionedUsers = await findUserIdsByUsernames(message.mentions);
            receivers = receivers.filter((receiver) => !mentionedUsers.includes(receiver));
            mentionedUsers = mentionedUsers.filter((mentionedUser) => mentionedUser !== userId);
        }
        const { groupName, channelName } = await findChatName(chatId, chatType);
        const unmutedUsers = await findUnmutedUsers(receivers, chatId, chatType);
        const payload = await handleNotificationPayload(message, chatType, groupName, channelName);
        if (repliedUserId) {
            let remainingDeviceTokens: UserToken[] = [];
            let repliedDeviceTokens: string[] = [];
            deviceTokens.forEach((deviceToken) => {
                if (deviceToken.userId === repliedUserId && deviceToken.deviceToken) {
                    repliedDeviceTokens.push(deviceToken.deviceToken);
                } else {
                    remainingDeviceTokens.push(deviceToken);
                }
            });
            deviceTokens = structuredClone(remainingDeviceTokens);
            await handleReplyNotification(structuredClone(payload), repliedUserId, unpreviwedMessageUsers, repliedDeviceTokens);
        }
        if (mentionedUsers.length > 0) {
            let remainingDeviceTokens: UserToken[] = [];
            let mentionedDeviceTokens: UserToken[] = [];
            deviceTokens.forEach((deviceToken) => {
                if (mentionedUsers.includes(deviceToken.userId) && deviceToken.deviceToken) {
                    mentionedDeviceTokens.push(deviceToken);
                } else {
                    remainingDeviceTokens.push(deviceToken);
                }
            });
            deviceTokens = structuredClone(remainingDeviceTokens);
            await handleMentionNotification(structuredClone(payload), mentionedUsers, unpreviwedMessageUsers, mentionedDeviceTokens);
        }
        if (unmutedUsers.length === 0) return;
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
            const cloudMessaging = await FirebaseAdmin.getInstance().messaging().sendEachForMulticast({
                tokens: userDeviceTokens,
                notification: copyPayload.notification,
                data: copyPayload.data,
            });
        }
    } catch (error: any) {
        console.log('Error in pushNotification');
    }
};



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
        console.log('Error in clearNotification');
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
        console.log('Error in pushVoiceNotification');
    }
};


export const handleUnseenMessageNotification = async (): Promise<void> => {
    try {
        const users = await handleNewActivityUsers();
        const usersIds = users.map((user) => user.userId);
        const deviceTokens = await findDeviceTokens(usersIds);
        for (let i = 0; i < users.length; i++) {
            const user = users[i];
            const userDeviceTokens = [] as string[];
            deviceTokens.forEach((deviceToken) => {
                if (deviceToken.userId === user.userId && deviceToken.deviceToken) {
                    userDeviceTokens.push(deviceToken.deviceToken);
                }
            });
            if (userDeviceTokens.length === 0) continue;
            const chatNames = user.chatNames.join(', ');
            let body: string = `There is new activaty in ${chatNames}`;
            const payload = {
                notification: {
                    title: "New Activaty",
                    body,
                },
                data: {
                    type: "unseen_message",
                },
            };
            await FirebaseAdmin.getInstance().messaging().sendEachForMulticast({
                tokens: userDeviceTokens,
                notification: payload.notification,
                data: payload.data,
            });
        }
    } catch (error: any) {
        console.log(`Error in handleUnseenMessageNotification`);
    }
}