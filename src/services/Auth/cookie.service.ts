import { Response } from "express";

function createCookie(res: Response, token: string) {
    res.cookie("token", token, {
        expires: new Date(Date.now() + parseInt(process.env.COOKIE_EXPIRE as string) * 3600000),
        httpOnly: true, //the cookie to be accessible only by the web server.
    });
}

function clearCookie(res: Response) {
    res.clearCookie("token", {
        httpOnly: true,
    });
}

export { createCookie, clearCookie };
