import { ChatType, Message, User } from "@prisma/client";

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
    name: string;
    picture: string;
};

export type ChatSummary = {
    id: number;
    othersId?: number;
    type: ChatType;
    participantKeys?: (number | null)[];
    name: string;
    lastSeen?: Date;
    isMuted: boolean;
    hasStory?: boolean;
    picture: string | null;
    status?: string;
    lastMessage: LastMessage;
    unreadMessageCount: number;
};

export type chatUserSummary = { userId: number; chatId: number };
export type chatUser = {
    user: { id: number; userName: string; profilePic: string };
    chatId: number;
};
export type MemberSummary = Pick<User, "id" | "userName" | "profilePic" | "lastSeen" | "hasStory">;
