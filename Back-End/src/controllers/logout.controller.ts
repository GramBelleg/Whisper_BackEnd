import { Request, Response } from "express";

async function logout(req: Request, res: Response): Promise<void> {
    try {
        res.clearCookie("token", {
            httpOnly: true,
            signed: true,
        });
        res.status(200).json({
            status: "success",
            message: "Logged out",
        });
    } catch (err: any) {
        console.error(err.message);
        res.status(400).json({
            status: "failed",
            message: err.message,
        });
    }
}

export default logout;
