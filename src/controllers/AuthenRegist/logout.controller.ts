import { Request, Response } from "express";
import { clearCookie } from "@services/AuthenRegist/cookie.service";
import { decrementUserDevices, resetUserDevices } from "@services/AuthenRegist/logout.service";

async function logoutOne(req: Request, res: Response): Promise<void> {
    try {
        decrementUserDevices(req.userId);
        clearCookie(res);
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
        resetUserDevices(req.userId);
        clearCookie(res);
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
