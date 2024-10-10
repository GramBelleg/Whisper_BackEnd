import db from "src/prisma/PrismaClient";

export const getChatParticipantsIds = async (chatId: number): Promise<number[]> => {
    const chatParticipants : Array<{ userId: number }> = await db.chatParticipant.findMany({
      where: { chatId },
      select: { userId: true },
    });
    return chatParticipants.map(participant => participant.userId);
};
