import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { verifyUserToken, getToken } from "@services/auth.service";
import { clearTokenCookie } from "@services/auth1/token.service";

const userAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const token = getToken(req);
        const id = await verifyUserToken(token);
        req.userId = id;
        next();
    } catch (e: any) {
        clearTokenCookie(res);
        res.status(401).json({
            status: "failed",
            message: e.message,
        });
    }
};

export default userAuth;
