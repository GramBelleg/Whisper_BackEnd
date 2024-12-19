import authClient from "@config/google.config";
import { getAccessToken, getUserData } from "@src/services/auth/google.auth.service";
import { faker } from "@faker-js/faker";
import axios from "axios";

jest.mock("axios");
jest.mock("@config/google.config");

describe("test get user data service", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should return user data", async () => {
        const data = {
            name: faker.person.fullName(),
            email: faker.internet.email()
        };
        (axios.get as jest.Mock).mockResolvedValueOnce({ data });
        const userData = await getUserData('authCode');
        expect(userData).toEqual({ userName: data.name, email: data.email });
        expect(axios.get).toHaveBeenCalled();
    });

    it("should return undefined", async () => {
        (axios.get as jest.Mock).mockRejectedValueOnce(new Error("Failed to get user data"));
        const userData = await getUserData('authCode');
        expect(userData).toBeUndefined();
        expect(axios.get).toHaveBeenCalled();
    });
});

describe("test get access token service", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should return access token", async () => {
        const accessToken = 'accessToken';
        (authClient.getToken as jest.Mock).mockResolvedValueOnce({ tokens: { access_token: accessToken } });
        const token = await getAccessToken('authCode');
        expect(token).toEqual(accessToken);
        expect(authClient.getToken).toHaveBeenCalled();
    });

    it("should throw an error", async () => {
        (authClient.getToken as jest.Mock).mockRejectedValueOnce(new Error("Failed to get access token"));
        await expect(getAccessToken('authCode')).rejects.toThrow(new Error("Failed to get access token"));
        expect(authClient.getToken).toHaveBeenCalled();
    });

    it("should throw an error", async () => {
        (authClient.getToken as jest.Mock).mockResolvedValueOnce({ tokens: {} });
        await expect(getAccessToken('authCode')).rejects.toThrow(new Error("Failed to exchange Auth Code for Access Token"));
        expect(authClient.getToken).toHaveBeenCalled();
    });
});
