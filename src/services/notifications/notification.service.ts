import FirebaseAdmin from "@src/FCM/admin";
import {
    findDeviceTokens,
    findUnmutedDMUsers,
    findUnmutedChannelUsers,
    findUnmutedGroupUsers,
} from "@src/services/notifications/prisma/find.service";
import { getChatType } from "@services/chat/chat.service";
import { ChatType } from "@prisma/client";
import HttpError from "@src/errors/HttpError";

export const pushMessageNotification = async (
    receivers: number[],
    chatId: number,
    message: any
): Promise<void> => {
    try {
        let title: string | undefined;
        let unmutedUsers: number[] = [];
        const chatType = await getChatType(chatId);
        if (chatType === ChatType.DM) {
            title = message.sender.userName;
            unmutedUsers = await findUnmutedDMUsers(receivers, chatId);
        } else if (chatType === ChatType.GROUP) {
            const { groupName, unmutedUsers: groupUnmutedUsers } = await findUnmutedGroupUsers(
                receivers,
                chatId
            );
            title = groupName;
            unmutedUsers = groupUnmutedUsers;
        } else {
            unmutedUsers = await findUnmutedChannelUsers(receivers, chatId);
            if (message.sender) title = message.sender.userName;
            else if (message.userName) title = message.userName;
        }
        if (unmutedUsers.length === 0) return;
        const deviceTokens = await findDeviceTokens(unmutedUsers);
        const deviceTokenList = [] as string[];
        deviceTokens.forEach((deviceToken) => {
            if (deviceToken.deviceToken) {
                deviceTokenList.push(deviceToken.deviceToken);
            }
        });
        if (deviceTokenList.length === 0) return;
        const payload = {
            notification: {
                title,
                body: message.text,
            },
            data: {
                type: "new_message",
                messageId: message.id.toString(),
            },
        };

        await FirebaseAdmin.getInstance().messaging().sendEachForMulticast({
            tokens: deviceTokenList,
            notification: payload.notification,
            data: payload.data,
        });
    } catch (error: any) {
        throw new HttpError(`Error in pushNotification`, 500);
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
