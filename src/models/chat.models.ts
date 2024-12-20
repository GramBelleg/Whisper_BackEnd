import { ChatType, Message, Status, User } from "@prisma/client";

type LastMessageSender = Pick<User, "id" | "userName">;

export type LastMessage =
    | null
    | (Pick<Message, "id" | "content" | "type" | "media" | "read" | "delivered" | "extension"> & {
          time: Date;
          sender: LastMessageSender;
      });

export type CreatedChat = {
    users: number[];
    senderKey: null | number;
    type: ChatType;
    name?: string;
    picture?: string;
};

export type ChatSummary = {
    id: number;
    othersId?: number;
    type: ChatType;
    participantKeys?: (number | null)[];
    name: string;
    lastSeen?: Date;
    hasStory?: boolean;
    picture: string | null;
    status?: string;
    lastMessage: LastMessage;
    unreadMessageCount: number;
    isMuted: number;
    isAdmin?: boolean;
};

export type ChatUserSummary = { userId: number; chatId: number };
export type ChatUser = {
    user: {
        id: number;
        userName: string;
        profilePic?: string | null;
        lastSeen?: Date | null;
        status?: Status | null;
        hasStory?: boolean;
    };
    chatId: number;
};
export type MemberSummary = Pick<User, "id" | "userName" | "profilePic"> & {
    isAdmin?: boolean;
    hasStory: boolean;
    lastSeen: Date | null;
    status: Status | null;
};
