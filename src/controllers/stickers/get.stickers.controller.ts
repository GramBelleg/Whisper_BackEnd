import { Request, Response } from "express";
import * as stickerService from "@services/stickers/sticker.service";
const getStickers = async (req: Request, res: Response) => {
    const stickers = await stickerService.getStickers();
    res.json(stickers);
};

export default getStickers;
