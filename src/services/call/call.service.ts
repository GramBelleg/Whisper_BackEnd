import {Call} from "@prisma/client";
import db from "@src/prisma/PrismaClient";
import { getChatParticipantsIds } from "@services/chat/chat.service";
import { isBlocked } from "@services/user/user.service";
import { chatType } from "@services/chat/chat.service";
import HttpError from "@src/errors/HttpError";
import { callSocket, callLog, cancelCall } from "@socket/web.socket";
import { pushVoiceNofication } from "@services/notifications/notification.service";
import { getSenderInfo } from "@services/user/user.service";
import { Message } from "@prisma/client";
import { createVoiceCallMessage, editMessage} from "@services/chat/message.service";
import { handleSaveMessage } from "@controllers/messages/send.message";
import { SentMessage } from "@models/messages.models";

const RtcTokenBuilder = require("@agora/src/RtcTokenBuilder2").RtcTokenBuilder;
const RtcRole = require("@agora/src/RtcTokenBuilder2").Role;

const appId = process.env.AGORA_APP_ID;
const appCertificate = process.env.AGORA_APP_CERTIFICATE;
// Set streaming permissions
const role = RtcRole.PUBLISHER;
// Token validity time in seconds
const tokenExpirationInSecond = 3600; // 1 hour
// The validity time of all permissions in seconds
const privilegeExpirationInSecond = 3600; // 1 hour


export const callToken = (userId: number, channelName: string): string => {
    const tokenWithUid = RtcTokenBuilder.buildTokenWithUid(appId, appCertificate, channelName, userId, role, tokenExpirationInSecond, privilegeExpirationInSecond);
    return tokenWithUid;
};




export const makeCall = async (userId: number, chatId: string) => {
    const chatIdNum = Number(chatId);
    if (isNaN(chatIdNum)) {
        throw new HttpError("Invalid chatId", 400);
    }
    const type = await chatType(chatIdNum);
    if (type === "" || type === "CHANNEL") {
        throw new HttpError("Can't make a call", 400);
    }
    let participants = await getChatParticipantsIds(chatIdNum);
    if(participants.indexOf(userId) === -1){
        throw new HttpError("User is not a participant of this chat", 400);
    }
    participants = participants.filter((participant) => participant !== userId);
    if (type === "DM") {
        const checkBlocked = await isBlocked(userId, participants[0]);
        if (checkBlocked) {
            throw new HttpError("Can't make a call Due to Block", 400);
        }
    }
    let tokens: string[] = [];
    const channelName: string = `chat-${chatId}`;
    for (let i = 0; i < participants.length; i++) {
        const token = callToken(participants[i], channelName);
        tokens.push(token);
    }
    const user = await getSenderInfo(userId);
    const content = `Call from ${user?.name}`;

    const message = await createVoiceCallMessage(userId, chatIdNum, content);
    const call: Call = await db.call.create({
        data: {
            chatId: chatIdNum,
            messageId: message.id,
            startedAt: new Date(),
        },
    });
    const notification = {...user,  chatId: chatId ,channelName: channelName};
    callSocket(participants, tokens, notification, message, userId);
    pushVoiceNofication(participants, tokens, notification);
    const token = callToken(userId, channelName);
    return token;
};


export const joinCall = async (chatId: string) => {
    const lastCall = await findCall(chatId);
    if(!lastCall.joinedAt){
        const call = await updateJoinTime(lastCall.id);
    }
    return lastCall.id;
};

const callDuration = (call: Call) => {
    const join = new Date(call.joinedAt!);
    const end = new Date(call.endedAt!);
    const diff = Math.abs(end.getTime() - join.getTime());
    const seconds = Math.floor(diff / 1000);
    return seconds;
}

export const leaveCall = async (chatId: string, endStatus: any) => {
    const lastCall = await findCall(chatId);
    const leave = await updateEndTime(lastCall.id, endStatus);
    if (!leave) {
        throw new HttpError("Call not found", 404);
    }
    const participants = await getChatParticipantsIds(lastCall.chatId);
    if(endStatus === "JOINED")
    {
        const duration = callDuration(lastCall);
        const editedMessage = await editMessage(lastCall.messageId, "Call Ended " + duration);
        callLog(participants, {id: editedMessage.id, content: editedMessage.content, chatId: editedMessage.chatId});
        return {duration: duration};
    }
    const editedMessage = await editMessage(lastCall.messageId, "Call Ended");
    if(endStatus === "CANCELED")
        cancelCall(participants, {chatId: chatId});
    callLog(participants, {id: editedMessage.id, content: editedMessage.content, chatId: editedMessage.chatId});
    return {duration: null};
};

const findCall = async (chatId: string) => {
    const chatIdNum = Number(chatId);
    const call = await db.call.findFirst({
        where: {
            chatId: chatIdNum,
            endedAt: null,
        },
    });
    if(!call){
        throw new HttpError("Call not found", 404);
    }
    return call;
};

const updateJoinTime = async (id: number) => {
    const call = await db.call.update({
        where:{
            id: id
        },
        data: {
            joinedAt: new Date(),
        },
    });
    return call;
};

const updateEndTime = async (id: number, endStatus: any) => {
    const call = await db.call.update({
        where:{
            id: id
        },
        data: {
            endedAt: new Date(),
            endStatus: endStatus,
        },
    });
    return call;
};