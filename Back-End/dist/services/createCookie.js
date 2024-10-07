"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function createCookie(res, token) {
    res.cookie("token", token, {
        expires: new Date(Date.now() + parseInt(process.env.COOKIE_EXPIRE) * 3600000), // cookie expire date
        httpOnly: true, //the cookie to be accessible only by the web server.
        signed: true, // Indicates that the cookie is signed with a secret key.
    });
}
exports.default = createCookie;
