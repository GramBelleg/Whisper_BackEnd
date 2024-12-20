import axios from "axios";
import { getUserData, getAccessToken } from "@services/auth/facebook.auth.service";
import { faker } from "@faker-js/faker";
jest.mock("axios");

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
        (axios.get as jest.Mock).mockResolvedValueOnce({ data: { access_token: accessToken } });
        const token = await getAccessToken('authCode');
        expect(token).toEqual(accessToken);
        expect(axios.get).toHaveBeenCalled();
    });

    it("should throw an error", async () => {
        (axios.get as jest.Mock).mockRejectedValueOnce(new Error("Failed to get access token"));
        await expect(getAccessToken('authCode')).rejects.toThrow(new Error("Failed to get access token"));
        expect(axios.get).toHaveBeenCalled();
    });
});