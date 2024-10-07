import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { User } from "@prisma/client";
import createCookie from "@services/AuthenRegist/cookie.service";
import findUser from "@services/AuthenRegist/login.service";
import { validateLogIn } from "@validators/user";

const login = async (req: Request, res: Response) => {
    try {
        //validate email and password from request
        const { email, password }: Record<string, string> = req.body;
        validateLogIn(email, password);

        //try to find user in db
        const user: User | null = await findUser(email, password);

        //create jwt and store it in a cookie
        const user_token: string = jwt.sign({ id: user.id }, process.env.JWT_SECRET as string, {
            expiresIn: process.env.JWT_EXPIRE,
        });
        createCookie(res, user_token);
        res.status(200).json({
            status: "success",
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
            },
            user_token,
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
