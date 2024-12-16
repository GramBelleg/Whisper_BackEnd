import { Request, Response } from "express";
import jwt, { TokenExpiredError } from "jsonwebtoken";
import { createUserToken } from "@services/auth/prisma/create.service";
import { findTokenByUserIdToken } from "@services/auth/prisma/find.service";
import { deleteUserToken } from "./prisma/delete.service";

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
    const user = await findTokenByUserIdToken(userId, userToken);
    if (!user) {
        throw new Error("User token not found");
    }
}

function getToken(req: Request) {
    if (req.cookies.token) {
        return req.cookies.token;
    } else if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        return req.headers.authorization.replace("Bearer", "").trim();
    } else {
        throw new Error("Token is not found");
    }
}

async function verifyUserToken(userToken: string) {
    let userId: number | undefined = undefined;
    try {
        userId = (
            jwt.verify(userToken, process.env.JWT_SECRET as string, {
                ignoreExpiration: true,
            }) as Record<string, any>
        ).id;
        if (!userId) throw new Error();
        await checkUserTokenExist(userId, userToken);
        // check expiration of token
        jwt.verify(userToken, process.env.JWT_SECRET as string);
        return userId;
    } catch (err: any) {
        if (err instanceof TokenExpiredError) {
            if (userId) deleteUserToken(userId, userToken);
        }
        throw new Error("Login again.");
    }
}
export {
    createTokenCookie,
    clearTokenCookie,
    createAddToken,
    checkUserTokenExist,
    getToken,
    verifyUserToken,
};
