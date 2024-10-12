export type EditChatMessages<
  T extends { id: number; senderId: number; chatId: number; content: string },
> = Pick<T, "id" | "senderId" | "chatId" | "content">;

export type OmitSender<T> = Omit<T, "senderId">;

export type SentMessage<
  T extends {
    content: string;
    chatId: number;
    selfDestruct: boolean;
    expiresAfter: number | null;
  },
> = Pick<T, "content" | "chatId" | "selfDestruct" | "expiresAfter">;

export {};
