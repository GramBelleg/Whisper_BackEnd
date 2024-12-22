import { Request, Response, NextFunction } from "express";
import { verifyUserToken, getToken, clearTokenCookie } from "@services/auth/token.service";

const userAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const redirect = String(process.env.GOOGLE_REDIRECT_URI);

    try {
        const token = getToken(req);
        const { userId, userRole } = await verifyUserToken(token);
        req.userId = userId;
        req.userRole = userRole as string;
        next();
    } catch (e: any) {
        clearTokenCookie(res);
        // res.status(401).json({
        //     status: "failed",
        //     message: e.message,
        // });
        res.status(401).redirect(redirect);
    }
};

export default userAuth;
