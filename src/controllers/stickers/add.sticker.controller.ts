import { Request, Response } from "express";
import * as stickerService from "@services/stickers/sticker.service";
import HttpError from "@src/errors/HttpError";
const addSticker = async (req: Request, res: Response) => {
    const blobName = req.body.sticker.blobName;
    if (!blobName) throw new HttpError("Sticker BlobName not found", 404);
    await stickerService.addSticker(blobName);
    res.json({
        status: "success",
        message: "sticker added successfully",
    });
};

export default addSticker;
