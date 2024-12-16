import { Request, Response, NextFunction } from "express";
import { verifyUserToken, clearTokenCookie } from "@services/auth/token.service";

const isValid = (req: Request) => {
    const x_api_key = process.env.API_KEY;
    return req.cookies.x_api_key == x_api_key || req.headers.x_api_key == x_api_key;
};
const apiAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        if (!isValid(req)) throw new Error("Incorrect Api Key");
        next();
    } catch (e: any) {
        clearTokenCookie(res);
        res.status(401).json({
            status: "failed",
            message: e.message,
        });
    }
};

export default apiAuth;
