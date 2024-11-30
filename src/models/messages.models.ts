import { Message, MessageType, User } from "@prisma/client";
import { SenderInfo } from "./user.models";

export type ParentMessage =
    | null
    | (Pick<Message, "id"> & {
          content: string | null;
          media: string | null;
          type: MessageType | null;
          senderId: number;
          senderName: string;
          senderProfilePic: string;
      });

type ForwardedFrom = null | Pick<User, "id" | "userName" | "profilePic">;

export type ToBeFormattedMessage = Omit<Message, "time" | "mentions"> & {
    parentMessage: ParentMessage;
    sender: SenderInfo;
    forwardedFrom: ForwardedFrom;
    mentions: null | string[];
};

export type ReceivedMessage = Omit<
    Message,
    | "forwardedFromUserId"
    | "parentMessageId"
    | "mentions"
    | "senderId"
    | "parentContent"
    | "parentMedia"
    | "parentExtension"
> & {
    parentMessage: ParentMessage;
    forwardedFrom: ForwardedFrom;
    sender: SenderInfo;
    mentions: null | string[];
    time: Date;
};

export type SentMessage = Pick<Message, "chatId" | "senderId" | "content" | "sentAt" | "type"> &
    Partial<
        Pick<
            Message,
            | "forwarded"
            | "selfDestruct"
            | "expiresAfter"
            | "media"
            | "extension"
            | "size"
            | "attachmentType"
            | "attachmentName"
            | "isSecret"
            | "isAnnouncement"
            | "mentions"
            | "parentMessageId"
            | "forwardedFromUserId"
        >
    >;

export type OmitSender<T> = Omit<T, "senderId">;

export type MessageReference = Pick<Message, "senderId" | "chatId"> & { messageId: number };

export type EditableMessage = MessageReference & Pick<Message, "content">;

export {};
