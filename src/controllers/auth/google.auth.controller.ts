import { Request, Response } from "express";
import { getAccessToken, getUserData } from "@services/auth/google.auth.service";
import { upsertUser } from "@services/auth/prisma/update.create.service";
import { createTokenCookie, createAddToken } from "@services/auth/token.service";
import { User } from "@prisma/client";

async function googleAuth(req: Request, res: Response): Promise<void> {
    const authCode: string | undefined = req.body.code;
    if (!authCode) {
        throw new Error("There is no Authorization Code");
    }

    const accessToken = await getAccessToken(authCode);

    const userData: Record<string, any> | undefined = await getUserData(accessToken);
    if (!userData) {
        throw new Error("Invalid Access Token");
    }

    const user: User = await upsertUser(userData);
    const { password, ...userWithoutPassword } = user;

    const userToken = await createAddToken(user.id);
    //*IMPORTANT* Make sure frontend sets withcredential: true so that the cookies are sent with the request
    createTokenCookie(res, userToken);

    res.status(200).json({
        status: "success",
        user: userWithoutPassword,
        userToken,
    });
}

export default googleAuth;
