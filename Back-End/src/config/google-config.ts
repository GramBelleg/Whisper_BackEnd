import { OAuth2Client } from "google-auth-library";

/**
 * This is the configuration of object which is used for signup, login using google
 */

// url of request which will be redirected to after sign-up or log-in using google service and contains a code as query string
const redirectURL: string = "http://127.0.0.1:5000/auth/google/callback";

// in Google Cloud console, when I create OAuth consent screen for the project, I include scopes of data which I want to get and see

const authClient: OAuth2Client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID as string,
    process.env.GOOGLE_CLIENT_SECRET as string,
    redirectURL as string
);

export default authClient;
