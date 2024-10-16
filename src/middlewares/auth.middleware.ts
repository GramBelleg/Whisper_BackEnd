import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { checkLogoutAll, getToken } from "@services/auth.service";
import { clearCookie } from "@services/AuthenRegist/cookie.service";

const userAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const token = getToken(req);
        const id: number = (
            jwt.verify(token, process.env.JWT_SECRET as string) as Record<string, any>
        ).id;
        await checkLogoutAll(id);
        req.userId = id;
        next();
    } catch (e: any) {
        clearCookie(res);
        console.log(e.message);
        let message: string = e.message;
        if (e instanceof jwt.TokenExpiredError) {
            message = "Expired Token. Login again";
        }
        res.status(401).json({
            status: "failed",
            message,
        });
    }
};

export default userAuth;
