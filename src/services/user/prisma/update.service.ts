import db from "@DB";
import HttpError from "@src/errors/HttpError";

const updateBlockOfRelates = async (userId: number, users: number[], blocked: boolean) => {
    try {
        await db.relates.updateMany({
            where: {
                relatingId: userId,
                relatedById: {
                    in: users
                },
            },
            data: {
                isBlocked: blocked
            }
        });
    } catch (err) {
        throw new HttpError("User relating updating failed", 409);
    }
}

const updateReadReceipt = async (userId: number, readReceipts: boolean) => {
    try {
        await db.user.update({
            where: { id: userId },
            data: { readReceipts }
        });
    } catch (err) {
        throw new HttpError("Read receipts updating failed", 409);
    }
}

const updateMessagePerview = async (userId: number, messagePreview: boolean) => {
    try {
        await db.user.update({
            where: { id: userId },
            data: { messagePreview }
        });
    } catch (err) {
        throw new HttpError("Message preview updating failed", 409);
    }
}


export { updateBlockOfRelates, updateReadReceipt, updateMessagePerview };