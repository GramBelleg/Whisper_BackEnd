import db from "@DB";

export const getStoryParticipant = async (userId: number, except: Array<number> = []): Promise<number[]> => {
    const contacts = await db.chat.findMany({
        where: {
            participants: {
                some: {
                    userId,
                    isContact: true,
                    NOT: { userId: { in: [...except, userId] } }
                }
            },
            type: "DM"
        },
        select: { participants: { select: { userId: true } } },
    });
    const results = contacts.flatMap((contact) => contact.participants.map((participant) => participant.userId));
    return results;
};