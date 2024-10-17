import { Request, Response } from "express";
import { validateSingUp } from "@validators/user";
import { checkEmailNotExist, saveUser, verifyRobotToken } from "@services/Auth/signup.service";
import { createCode, sendCode } from "@services/Auth/confirmation.service";

const signup = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, email, password }: Record<string, string> = req.body;
        const phoneNumber = validateSingUp(req.body);
        // in DB
        await checkEmailNotExist(email);

        await verifyRobotToken(req.body.robotToken);

        const code = await createCode(email, "confrimEmail");
        const emailBody = `<h3>Hello, </h3> <p>Thanks for joining our family. Use this code: <b>${code}</b> for verifing your email</p>`;
        await sendCode(email, emailBody);

        await saveUser(name, email, phoneNumber, password);

        res.status(200).json({
            status: "success",
            user_data: {
                name,
                email,
            },
        });
    } catch (e: any) {
        console.log(e.message);
        res.status(400).json({
            status: "failed",
            message: e.message,
        });
    }
};

export default signup;
