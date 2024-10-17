import { User } from "@prisma/client";
import db from "@DB";
import bcrypt from "bcrypt";
import randomstring from "randomstring";
import axios from "axios";
//This is a service for making a request to get user data of google account based on specified scopes using google tokenThis is a service for making a request to get user data of google account based on specified scopes using google token

const getAccessToken = async (authCode: string): Promise<string> => {
    try {
        const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
        const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

        const tokenResponse = await axios.post(
            `https://github.com/login/oauth/access_token`,
            null,
            {
                params: {
                    client_id: GITHUB_CLIENT_ID,
                    client_secret: GITHUB_CLIENT_SECRET,
                    code: authCode,
                },
                headers: {
                    accept: "application/json",
                },
            }
        );

        const accessToken = tokenResponse.data.access_token;
        if (!accessToken) throw new Error("Empty Access Token");
        return accessToken;
    } catch (err: any) {
        throw new Error(err.message);
    }
};

const getUserData = async (accessToken: string): Promise<Record<string, any> | undefined> => {
    try {
        const userResponse = await axios.get(`https://api.github.com/user`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
        return userResponse.data;
    } catch (err: any) {
        console.log(err.message);
        return undefined;
    }
};


export { getUserData, getAccessToken };
