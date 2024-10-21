import { Request, Response } from "express";
import { User } from "@prisma/client";
import { createTokenCookie, createAddToken } from "@services/Auth/token.service";
import {
    checkEmailExistDB,
    checkPasswordCorrect
} from "@services/Auth/login.service";
import { validateLogIn } from "@validators/user";

const login = async (req: Request, res: Response) => {
    try {
        const { email, password }: Record<string, string> = req.body;
        validateLogIn(req.body);

        const user: User = await checkEmailExistDB(email);
        checkPasswordCorrect(password, user.password);

        const userToken = await createAddToken(user.id);
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
    } catch (e: any) {
        console.log(e.message);
        res.status(400).json({
            status: "failed",
            message: e.message,
        });
    }
};

export default login;
