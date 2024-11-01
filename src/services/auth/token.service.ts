import { Response } from "express";
import jwt from "jsonwebtoken";
import { createUserToken } from "@services/prisma/create.service";
import { findUserByUserToken } from "@services/prisma/find.service";

function createTokenCookie(res: Response, token: string) {
    res.cookie("token", token, {
        expires: new Date(
            Date.now() + parseInt(process.env.COOKIE_EXPIRE as string) * 1000 * 60 * 60
        ),
        httpOnly: true, //the cookie to be accessible only by the web server.
        secure: process.env.NODE_ENV === "production",
    });
}

function clearTokenCookie(res: Response) {
    res.clearCookie("token", {
        httpOnly: true,
    });
}

async function createAddToken(userId: number) {
    try {
        const userToken: string = jwt.sign(
            { id: userId, timestamp: Date.now() },
            process.env.JWT_SECRET as string,
            {
                expiresIn: process.env.JWT_EXPIRE,
            }
        );
        const expireAt = new Date(Date.now() + parseInt(process.env.TOKEN_EXPIRE as string) * 1000);
        await createUserToken(userToken, expireAt, userId);
        return userToken;
    } catch (err: any) {
        throw new Error("User token creation failed");
    }
}


async function checkUserTokenExist(userId: number, userToken: string) {
    const user = await findUserByUserToken(userId, userToken);
    if (!user) {
        throw new Error("User token not found");
    }
}

export {
    createTokenCookie,
    clearTokenCookie,
    createAddToken,
    checkUserTokenExist,
};
