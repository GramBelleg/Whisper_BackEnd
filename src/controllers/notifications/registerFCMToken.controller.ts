import { Request, Response } from "express";
import { updateFCMToken } from "@services/notifications/prisma/update.service";
import { validateFCMToken } from "@validators/user";
import { getToken } from "@services/auth/token.service";

export const handleUpdateFCMToken = async (req: Request, res: Response) => {
    const fcmToken = req.body.fcmToken?.trim();
    validateFCMToken(fcmToken);
    await updateFCMToken(req.userId, getToken(req), req.body.fcmToken);
    res.status(200).json({ status: "success" });
};