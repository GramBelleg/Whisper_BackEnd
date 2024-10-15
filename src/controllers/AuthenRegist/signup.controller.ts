import { Request, Response } from "express";
import Randomstring from "randomstring";
import sendEmail from "@services/AuthenRegist/send.email.service";
import { validateSingUp } from "@validators/user";
import { findUser, upsertUser } from "@services/AuthenRegist/signup.service";

const signup = async (req: Request, res: Response): Promise<void> => {
    try {
        //validate user data recieved from request body
        const { name, email, password, confirmPassword }: Record<string, string> = req.body;
        let phoneNumber: string = req.body.phoneNumber;
        phoneNumber = validateSingUp(name, email, phoneNumber, password, confirmPassword);
        //check if user is found in database
        await findUser(email, password);

        //send verification code to email
        const verificationCode: string = Randomstring.generate(8);
        const info: string | undefined = await sendEmail(verificationCode, email);
        if (!info) {
            throw new Error("Error in sending email");
        }

        //upsert user in db
        await upsertUser(name, email, phoneNumber, password, verificationCode);
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
