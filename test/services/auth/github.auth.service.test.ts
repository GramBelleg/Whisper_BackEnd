import { getAccessToken, getUserData } from "@src/services/auth/github.auth.service";
import { faker } from "@faker-js/faker";
import axios from "axios";

jest.mock("axios");

describe("test get user data service", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should return user data", async () => {
        const mockUserResponse = {
            data: {
                login: 'githubUser',
            },
        };

        const mockEmailResponse = {
            data: [
                { email: 'user@example.com', primary: true, verified: true },
                { email: 'backup@example.com', primary: false, verified: true },
            ],
        };
        (axios.get as jest.Mock).mockImplementation((url) => {
            if (url === 'https://api.github.com/user') {
                return Promise.resolve(mockUserResponse);
            } else if (url === 'https://api.github.com/user/emails') {
                return Promise.resolve(mockEmailResponse);
            }
            return Promise.reject(new Error('Unexpected URL'));
        });
        const userData = await getUserData('authCode');
        expect(userData).toEqual({ userName: mockUserResponse.data.login, email: mockEmailResponse.data[0].email });
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
        (axios.post as jest.Mock).mockResolvedValueOnce({ data: { access_token: accessToken } });
        const token = await getAccessToken('authCode');
        expect(token).toEqual(accessToken);
        expect(axios.post).toHaveBeenCalled();
    });

    it("should throw an error", async () => {
        (axios.post as jest.Mock).mockRejectedValueOnce(new Error("Failed to get access token"));
        await expect(getAccessToken('authCode')).rejects.toThrow(new Error("Failed to get access token"));
        expect(axios.post).toHaveBeenCalled();
    });

    it("should throw an error", async () => {
        (axios.post as jest.Mock).mockResolvedValueOnce({ data: {} });
        await expect(getAccessToken('authCode')).rejects.toThrow(new Error("Empty Access Token"));
        expect(axios.post).toHaveBeenCalled();
    });
});