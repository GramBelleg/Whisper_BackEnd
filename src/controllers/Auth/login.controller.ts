import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { User } from "@prisma/client";
import { createCookie } from "@services/auth/cookie.service";
import {
    checkEmailExist,
    checkPasswordCorrect,
    incrementUserDevices,
} from "@services/auth/login.service";
import { validateLogIn } from "@validators/user";

const login = async (req: Request, res: Response) => {
    try {
        const { email, password }: Record<string, string> = req.body;
        validateLogIn(email, password);

        //in DB
        const user: User = await checkEmailExist(email);
        checkPasswordCorrect(password, user.password);

        const userToken: string = jwt.sign({ id: user.id }, process.env.JWT_SECRET as string, {
            expiresIn: process.env.JWT_EXPIRE,
        });
        incrementUserDevices(user.id);
        createCookie(res, userToken);
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
