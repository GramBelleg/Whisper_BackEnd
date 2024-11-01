import { Request, Response } from "express";
import { createTokenCookie, createAddToken } from "@services/auth/token.service";
import { checkEmailExistDB, checkPasswordCorrect } from "@services/auth/login.service";
import { validateLogIn } from "@validators/user";

const login = async (req: Request, res: Response) => {
    req.body.email = req.body.email?.trim().toLowerCase();
    const { email, password }: Record<string, string> = req.body;
    validateLogIn(req.body);

    const user = await checkEmailExistDB(email);
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
};

export default login;
