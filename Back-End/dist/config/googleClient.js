"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const google_auth_library_1 = require("google-auth-library");
/**
 * This is the configuration of object which is used for signup, login using google
 */
// url of request which will be redirected to after sign-up or log-in using google service and contains a code as query string
const redirectURL = "http://127.0.0.1:5000/auth/google/callback";
// in Google Cloud console, when I create OAuth consent screen for the project, I include scopes of data which I want to get and see
const authClient = new google_auth_library_1.OAuth2Client(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, redirectURL);
exports.default = authClient;
