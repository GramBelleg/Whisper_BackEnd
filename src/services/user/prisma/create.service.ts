import db from "@DB";
import HttpError from "@src/errors/HttpError";

const createRelates = async (userId: number, users: number[], blocked: boolean) => {
    try {
        await db.relates.createMany({
            data: users.map((user) => {
                return {
                    relatingId: userId,
                    relatedById: user,
                    isBlocked: blocked,
                    isContact: false
                }
            }),
            skipDuplicates: true
        });
    } catch (err) {
        throw new HttpError("Relates creating failed", 409);
    }
}

export { createRelates };