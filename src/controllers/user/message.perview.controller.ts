import { Request, Response } from "express";
import { updateMessagePerview } from "@services/user/prisma/update.service";
import HttpError from "@src/errors/HttpError";

const handleMessagePreview = async (req: Request, res: Response) => {
    const { messagePreview } = req.body;
    if(messagePreview === undefined) {
        throw new HttpError("Message preview is required", 400);
    }
    await updateMessagePerview(req.userId, messagePreview);
    res.status(200).json({
        status: "success",
        message: "Message preview has been updated successfully.",
    });
}

export { handleMessagePreview };