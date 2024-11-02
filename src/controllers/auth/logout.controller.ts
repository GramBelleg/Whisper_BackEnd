import { Request, Response } from "express";
import { clearTokenCookie } from "@services/auth/token.service";
import { deleteUserToken, deleteAllUserTokens } from "@services/prisma/auth/delete.service";
import { getToken } from "@services/auth.service";

async function logoutOne(req: Request, res: Response): Promise<void> {
    const userToken = getToken(req);
    await deleteUserToken(req.userId, userToken);
    clearTokenCookie(res);
    res.status(200).json({
        status: "success",
        message: "Logged out from this device",
    });
}

async function logoutAll(req: Request, res: Response): Promise<void> {
    await deleteAllUserTokens(req.userId);
    clearTokenCookie(res);
    res.status(200).json({
        status: "success",
        message: "Logged out from all devices",
    });
}

export { logoutAll, logoutOne };
