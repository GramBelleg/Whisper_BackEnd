import authClient from "@config/google.config";

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
        const response: Response = await fetch(
            `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${token}`
        );
        const data: Record<string, any> = await response.json();
        return data;
    } catch (err: any) {
        console.log(err.message);
        return undefined;
    }
};


export { getUserData, getAccessToken };
