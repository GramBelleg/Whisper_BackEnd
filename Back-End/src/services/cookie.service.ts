import { Response } from "express";

function createCookie(res: Response, token: string) {
    res.cookie("token", token, {
        expires: new Date(
            Date.now() + parseInt(process.env.COOKIE_EXPIRE as string) * 3600000
        ), // cookie expire date
        httpOnly: true, //the cookie to be accessible only by the web server.
        signed: true, // Indicates that the cookie is signed with a secret key.
    });
}

export default createCookie;
