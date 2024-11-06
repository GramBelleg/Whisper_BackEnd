import { Request, Response } from "express";
import { getAccessToken, getUserData } from "@services/auth/github.auth.service";
import { upsertUser } from "@services/auth/prisma/update.create.service";
import { createTokenCookie, createAddToken } from "@services/auth/token.service";
import { User } from "@prisma/client";

async function githubAuth(req: Request, res: Response): Promise<void> {
    try {
        const authCode: string = req.body.code;
        if (!authCode) {
            throw new Error("There is no Authorization Code");
        }

        const accessToken = await getAccessToken(authCode);

        const userData: Record<string, any> | undefined = await getUserData(accessToken);
        if (!userData) {
            throw new Error("No User Data retrieved");
        }

        const user: User = await upsertUser(userData);

        const userToken = await createAddToken(user.id);
        createTokenCookie(res, userToken);

        res.status(200).json({
            status: "success",
            user: {
                id: req.userId,
                userName: user.userName,
                name: user.name,
                profilePic: user.profilePic,
                email: user.email,
                readReceipts: user.readReceipts,
            },
            userToken,
        });
    } catch (err: any) {
        console.log(err.message);
        res.status(400).json({
            status: "failed",
            message: err.message,
        });
    }
}

export { githubAuth };
