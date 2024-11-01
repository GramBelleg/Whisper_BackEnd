import { Request, Response } from "express";
import { clearTokenCookie } from "@services/auth/token.service";
import { deleteUserToken, deleteAllUserTokens } from "@services/prisma/delete.service";
import { getToken } from "@services/auth.service";

async function logoutOne(req: Request, res: Response): Promise<void> {
    try {
        const userToken = getToken(req);
        await deleteUserToken(req.userId, userToken);
        clearTokenCookie(res);
        res.status(200).json({
            status: "success",
            message: "Logged out from this device",
        });
    } catch (err: any) {
        console.error(err.message);
        res.status(400).json({
            status: "failed",
            message: err.message,
        });
    }
}

async function logoutAll(req: Request, res: Response): Promise<void> {
    try {
        await deleteAllUserTokens(req.userId);
        clearTokenCookie(res);
        res.status(200).json({
            status: "success",
            message: "Logged out from all devices",
        });
    } catch (err: any) {
        console.error(err.message);
        res.status(400).json({
            status: "failed",
            message: err.message,
        });
    }
}

export { logoutAll, logoutOne };
