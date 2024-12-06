import { Chat } from "@prisma/client";
import db from "@src/prisma/PrismaClient";
import { getChatParticipantsIds } from "@services/chat/chat.service";
import { isBlocked } from "@services/user/user.service";
import { chatType } from "@services/chat/chat.service";
import HttpError from "@src/errors/HttpError";
import { call } from "@socket/handlers/call.handlers";


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
 

export const callToken = (userId: number, channelName: number): string => {
    const tokenWithUid = RtcTokenBuilder.buildTokenWithUid(appId, appCertificate, channelName, userId, role, tokenExpirationInSecond, privilegeExpirationInSecond);
    return tokenWithUid;
};

export const makeCall = async (chatId: number, userId: number) => {
    const type = await chatType(chatId);
    if(type === "" || type === "CHANNEL") {
        throw new HttpError("Can't make a call", 400);
    }
    let participants = await getChatParticipantsIds(chatId);
    participants = participants.filter((participant) => participant !== userId);
    if(type === "DM") {
      const checkBlocked = await isBlocked(userId ,participants[0]);
      if (checkBlocked) {
          throw new HttpError("Can't make a call Due to Block", 400);
      }
    }
    call(participants, chatId);
    const token = callToken(userId, chatId);
    return token;
};