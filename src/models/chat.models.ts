import { ChatType, MessageType, User } from "@prisma/client";

export type LastMessage = {
    id: number;
    content: string;
    type: MessageType;
    sentAt: Date;
    time: Date;
};

export type ChatSummary = {
    other: any;
    type: ChatType;
    lastMessage: any;
    unreadMessageCount: number;
};

export type MemberSummary = Pick<User, "id" | "userName" | "profilePic" | "lastSeen" | "hasStory">;
