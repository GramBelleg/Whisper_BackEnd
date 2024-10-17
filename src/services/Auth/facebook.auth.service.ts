import { User } from "@prisma/client";
import db from "@DB";
import bcrypt from "bcrypt";
import randomstring from "randomstring";
import axios from "axios";

//This is a service for making a request to get user data of google account based on specified scopes using google tokenThis is a service for making a request to get user data of google account based on specified scopes using google token

const getAccessToken = async (authCode: string): Promise<string> => {
    try {
        const url = `https://graph.facebook.com/v10.0/oauth/access_token?client_id=${process.env.FB_CLIENT_ID}&client_secret=${process.env.FB_CLIENT_SECRET}&code=${authCode}&redirect_uri=${process.env.FB_REDIRECT_URI}`;

        const response = await axios.get(url);
        return response.data.access_token;
    } catch (err: any) {
        throw new Error(err.message);
    }
};

const getUserData = async (accessToken: string): Promise<Record<string, any> | undefined> => {
    try {
        const url = `https://graph.facebook.com/me?access_token=${accessToken}&fields=id,name,email`;
        const response = await axios.get(url);
        return response.data;
    } catch (err: any) {
        console.log(err.message);
        return undefined;
    }
};


export { getUserData, getAccessToken };
