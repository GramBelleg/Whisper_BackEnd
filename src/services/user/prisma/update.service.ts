import db from "@DB";
import HttpError from "@src/errors/HttpError";

const updateRelates = async (userId: number, users: number[], blocked: boolean) => {
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


export { updateRelates, updateReadReceipt };