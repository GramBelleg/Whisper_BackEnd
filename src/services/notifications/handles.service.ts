import FirebaseAdmin from "@src/FCM/admin";
import { ChatType } from "@prisma/client";
import HttpError from "@src/errors/HttpError";
import { UserToken } from "@prisma/client";
import { findNewActivityUsers } from "./prisma/find.service";


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
            messageType: "Decrypted Message",
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
            payload.data.messageType = "Encrypted Message";
    } else if (chatType === ChatType.GROUP) {
        payload.notification.title = groupName + ": " + message.sender.userName;
    } else {
        payload.notification.title = channelName;
    }
    return payload;
}

export const handleReplyNotification = async (
    payload: Record<string, any>,
    receiver: number,
    unpreviwedMessageUsers: number[],
    deviceTokens: string[]
) => {
    try {
        if (deviceTokens.length === 0) return;
        if (unpreviwedMessageUsers.includes(receiver)) {
            payload.notification.body = "New Message";
        } else {
            payload.notification.body = 'Replied to your message ' + payload.notification.body;
        }
        payload.data.type = "reply_message";
        const cloudMessaging = await FirebaseAdmin.getInstance().messaging().sendEachForMulticast({
            tokens: deviceTokens,
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
    unpreviwedMessageUsers: number[],
    deviceTokens: UserToken[]
) => {
    try {
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
            } else {
                copyPayload.notification.body = "Mentioned you " + copyPayload.notification.body;
            }
            payload.data.type = 'mention_message';
            const cloudMessaging = await FirebaseAdmin.getInstance().messaging().sendEachForMulticast({
                tokens: deviceTokenList,
                notification: copyPayload.notification,
                data: copyPayload.data,
            });
        }
    } catch (error: any) {
        throw new HttpError(`Error in handleMentionNotification`, 500);
    }
}

export const handleNewActivityUsers = async () => {
    const users = await findNewActivityUsers();
    let listed_users: { userId: number; chatNames: string[]; }[] = [];
    users.forEach((user) => {
        let chatName: string = '';
        if (user.chat.group) {
            chatName = user.chat.group.name;
        }
        if (user.chat.channel) {
            chatName = user.chat.channel.name;
        }
        const index = listed_users.findIndex((listed_user) => listed_user.userId === user.userId);
        if (index === -1) {
            listed_users.push({ userId: user.userId, chatNames: [chatName] });
        } else {
            listed_users[index].chatNames.push(chatName);
        }
    });
    return listed_users;
}