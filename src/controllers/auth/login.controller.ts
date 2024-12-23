import { Request, Response } from "express";
import { createTokenCookie, createAddToken } from "@services/auth/token.service";
import { checkEmailExistDB, checkPasswordCorrect } from "@services/auth/login.service";
import { validateEmail, validatePassword } from "@validators/auth";

const login = async (req: Request, res: Response) => {
    req.body.email = req.body.email?.trim().toLowerCase();
    const { email, password }: Record<string, string> = req.body;
    validateEmail(email);
    validatePassword(password);

    const user = await checkEmailExistDB(email);
    if (user.banned) {
        res.status(403).json({
            status: "error",
            message: "Your account is suspended. Please contact support",
            user: null,
            userToken: null,
        });
        return;
    }
    const { password: hashedPassword, ...userWithoutPassword } = user;
    checkPasswordCorrect(password, user.password);

    const userToken = await createAddToken(user.id, user.role);
    createTokenCookie(res, userToken);
    res.status(200).json({
        status: "success",
        user: userWithoutPassword,
        userToken,
    });
};

export default login;
