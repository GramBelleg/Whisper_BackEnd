export type MessageIndex = {
    messageId: number;
    userId?: number;
    userName: string;
    senderId: number;
    content: string;
    chatId: number;
    profilePic: string | null;
    media: string[];
    time: Date;
};
