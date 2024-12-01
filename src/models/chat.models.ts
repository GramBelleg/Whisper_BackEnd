import { ChatType, Message, User } from "@prisma/client";

type LastMessageSender = Pick<User, "id" | "userName">;

export type LastMessage =
    | null
    | (Pick<Message, "id" | "content" | "type" | "media"> & {
          time: Date;
          sender: LastMessageSender;
      });

export type CreatedChat = {
    users: number[];
    senderKey: null | number;
    type: ChatType;
};

export type ChatSummary = {
    id: number;
    othersId: number;
    type: ChatType;
    participantKeys: { keyId: number | null }[];
    name: string;
    lastSeen: Date;
    isMuted: boolean;
    hasStory: boolean;
    picture: string;
    lastMessage: LastMessage;
    unreadMessageCount: number;
};

export type MemberSummary = Pick<User, "id" | "userName" | "profilePic" | "lastSeen" | "hasStory">;
