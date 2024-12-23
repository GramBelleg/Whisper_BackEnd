import authClient from "@config/google.config";
import axios from "axios";

//This is a service for making a request to get user data of google account based on specified scopes using google tokenThis is a service for making a request to get user data of google account based on specified scopes using google token

const getAccessToken = async (authCode: string): Promise<string> => {
    try {
        const { tokens } = await authClient.getToken(authCode);

        //tokens contain {access_token,refresh_token,id_tokens}
        const accessToken = tokens.access_token;

        if (!accessToken) throw new Error("Failed to exchange Auth Code for Access Token");
        return accessToken;
    } catch (err: any) {
        throw new Error(err.message);
    }
};

const getUserData = async (token: string): Promise<Record<string, any> | undefined> => {
    try {
        const response = await axios.get(
            `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${token}`
        );
        const data: Record<string, any> = response.data;
        const wantedData = { userName: data.name, email: data.email };
        return wantedData;
    } catch (err: any) {
        console.log(err.message); //TODO: throw error again
        return undefined;
    }
};

export { getUserData, getAccessToken };
