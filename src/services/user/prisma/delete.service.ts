import db from '@DB';

const deleteExtraRelates = async () => {
    try {
        await db.relates.deleteMany({
            where: {
                isContact: false,
                isBlocked: false
            }
        });
    } catch (err: any) {
        console.log("Extra relates deletion failed");
    }
}

export { deleteExtraRelates };