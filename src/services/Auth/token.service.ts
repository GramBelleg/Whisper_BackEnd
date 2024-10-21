import { Response } from "express";
import jwt from "jsonwebtoken";
import db from "@DB";
import { UserToken } from "@prisma/client";

function createTokenCookie(res: Response, token: string) {
    res.cookie("token", token, {
        expires: new Date(Date.now() + parseInt(process.env.COOKIE_EXPIRE as string) * 1000),
        httpOnly: true, //the cookie to be accessible only by the web server.
    });
}

function clearTokenCookie(res: Response) {
    res.clearCookie("token", {
        httpOnly: true,
    });
}

async function createAddToken(userId: number) {
    try {
        const userToken: string = jwt.sign({ id: userId }, process.env.JWT_SECRET as string, {
            expiresIn: process.env.JWT_EXPIRE,
        });
        const expireAt = new Date(Date.now() + parseInt(process.env.TOKEN_EXPIRE as string) * 1000);
        const token: UserToken = await db.userToken.create({
            data: {
                token: userToken,
                expireAt,
                userId,
            },
        });
        return userToken;
    } catch (err: any) {
        throw err;
    }
}

async function deleteUserToken(userId: number, userToken: string) {
    try {
        await db.user.update({
            where: { id: userId },
            data: {
                tokens: {
                    deleteMany: {
                        token: userToken,
                    },
                },
            },
        });
    } catch (err) {
        throw new Error("Error in deleting token");
    }
}

async function deleteAllUserTokens(userId: number) {
    try {
        await db.user.update({
            where: { id: userId },
            data: {
                tokens: {
                    deleteMany: {},
                },
            },
        });
    } catch (err) {
        throw new Error("Error in deleting all tokens of user");
    }
}

async function checkUserTokenExist(userId: number, userToken: string) {
    const user = await db.user.findUnique({
        where: {
            id: userId,
            tokens: {
                some: {
                    token: userToken,
                },
            },
        },
    });
    if (!user) {
        throw new Error();
    }
}

async function deleteExpiredTokens() {
    try {
        await db.userToken.deleteMany({
            where: {
                expireAt: {
                    lte: new Date(),
                },
            },
        });
    } catch (err: any) {
        console.log("Error in deleting expired tokens on database");
    }
}

export {
    createTokenCookie,
    clearTokenCookie,
    createAddToken,
    deleteUserToken,
    deleteAllUserTokens,
    checkUserTokenExist,
    deleteExpiredTokens,
};
