import { Request, Response } from "express";
import { getAccessToken, getUserData } from "@services/auth/facebook.auth.service"; // You'll need to create this service
import { upsertUser } from "@services/auth/prisma/update.create.service";
import { createTokenCookie, createAddToken } from "@services/auth/token.service";
import { User } from "@prisma/client";

async function facebookAuth(req: Request, res: Response): Promise<void> {
    const { code } = req.body;
    if (!code) {
        throw new Error("Authorization code is missing");
    }

    const accessToken = await getAccessToken(code);
    const userData: Record<string, any> | undefined = await getUserData(accessToken);
    if (!userData) {
        throw new Error("Invalid Access Token");
    }
    console.log(userData);
    const user: User = await upsertUser(userData);

    const userToken = await createAddToken(user.id, user.role);
    createTokenCookie(res, userToken);

    res.status(200).json({
        status: "success",
        user: {
            id: user.id,
            name: user.name,
            userName: user.userName,
            email: user.email,
        },
        userToken,
    });
}

export { facebookAuth };
