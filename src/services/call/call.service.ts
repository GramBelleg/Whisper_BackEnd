import {Call} from "@prisma/client";
import db from "@src/prisma/PrismaClient";
import { getChatParticipantsIds } from "@services/chat/chat.service";
import { isBlocked } from "@services/user/user.service";
import { chatType } from "@services/chat/chat.service";
import HttpError from "@src/errors/HttpError";
import { callSocket, callLog } from "@socket/web.socket";
import { pushVoiceNofication } from "@services/notifications/notification.service";
import { getSenderInfo } from "@services/user/user.service";
import { Message } from "@prisma/client";
import { createVoiceCallMessage } from "@services/chat/message.service";
import { Duration } from "luxon";

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

    const message: Message = await createVoiceCallMessage(userId, chatIdNum, content);
    const call: Call = await db.call.create({
        data: {
            chatId: chatIdNum,
            userId: userId,
            messageId: message.id,
            startedAt: new Date(),
        },
    });
    const notification = {...user,  chatId: chatId ,channelName: channelName};
    callSocket(participants, tokens, notification, message);
    pushVoiceNofication(participants, tokens, notification);
    const token = callToken(userId, channelName);
    return token;
};


export const joinCall = async (userId: number, chatId: string) => {
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
    const user = await getSenderInfo(userId);
    const Message: Message = await createVoiceCallMessage(userId, Number(chatId), `${user?.name} joined the call`);
    const call: Call = await db.call.create({
        data: {
            chatId: Number(chatId),
            userId: userId,
            messageId: Message.id,
            joinedAt: new Date(),
        },
    });
    callLog(participants, Message);
    return call.id;
};

export const leaveCall = async (userId: number, chatId: string, endStatus: any, callId: number) => {
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
    const user = await getSenderInfo(userId);
    const Message: Message = await createVoiceCallMessage(userId, Number(chatId), `${user?.name} ended the call`);
    const call: Call = await db.call.update({
        where:{
            id: callId
        },
        data: {
            chatId: Number(chatId),
            userId: userId,
            messageId: Message.id,
            endedAt: new Date(),
            endStatus: endStatus
        },
    });
    callLog(participants, Message);
    if(endStatus === "JOINED")
        return {endedAt: call.endedAt, duration: Duration.fromObject({milliseconds: call.endedAt!.getTime() - call.joinedAt!.getTime()}).toFormat("hh:mm:ss")};
    return {endedAt: call.endedAt}; 
};