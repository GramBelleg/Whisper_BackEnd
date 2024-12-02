import db from "@DB";

const addSticker = async (blobName: string) => {
    await db.stickers.create({
        data: {
            blobName,
        },
    });
};
const getStickers = async () => {
    const stickers = await db.stickers.findMany();
    return { stickers };
};
export { addSticker, getStickers };
