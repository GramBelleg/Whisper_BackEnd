import { validateBlockData, validateReadReceipt, validateFCMToken } from '@src/validators/user';
import HttpError from "@src/errors/HttpError";


describe("test validateBlockData", () => {
    it("should validate block data be successfully", () => {
        const data = {
            users: [1, 2, 3],
            blocked: true
        };
        expect(() => validateBlockData(data.users as any, data.blocked)).not.toThrow();
    });

    it("should validate block data be unsuccessfully in case of empty array", () => {
        const data = {
            users: [],
            blocked: true
        };
        expect(() => validateBlockData(data.users as any, data.blocked)).toThrow(new HttpError("At least one user is required", 422));
    });

    it("should validate block data be unsuccessfully in case of not existed users", () => {
        const data = {
            users: undefined,
            blocked: true
        };
        expect(() => validateBlockData(data.users as any, data.blocked)).toThrow(new HttpError("Users are required", 422));
    });

    it("should validate block data be unsuccessfully in case of array of not number elements", () => {
        const data = {
            users: ["fefe", "aefefs"],
            blocked: true
        };
        expect(() => validateBlockData(data.users as any, data.blocked)).toThrow(new HttpError("User must be a number", 422));
    });

    it("should validate block data be unsuccessfully in case of not exist blocked", () => {
        const data = {
            users: [5],
            blocked: undefined
        };
        expect(() => validateBlockData(data.users, data.blocked as any)).toThrow(new HttpError("Block is required", 422));
    });
});

describe("test validateReadReceipt", () => {
    it("should validate read receipt be successfully", () => {
        const data = {
            readReceipts: true
        };
        expect(() => validateReadReceipt(data.readReceipts)).not.toThrow();
    });

    it("should validate read receipt be unsuccessfully in case of not boolean", () => {
        const data = {
            readReceipts: "true"
        };
        expect(() => validateReadReceipt(data.readReceipts as any)).toThrow(new HttpError("Read receipts must be a boolean", 422));
    });

    it("should validate read receipt be unsuccessfully in case of not existed", () => {
        expect(() => validateReadReceipt(undefined as any)).toThrow(new HttpError("Read receipts is required", 422));
    });
});

describe("test validateFCMToken", () => {
    it("should validate FCM token be successfully", () => {
        const data = {
            fcmToken: "fcmToken"
        };
        expect(() => validateFCMToken(data.fcmToken)).not.toThrow();
    });

    it("should validate FCM token be unsuccessfully in case of not string", () => {
        const data = {
            fcmToken: 123
        };
        expect(() => validateFCMToken(data.fcmToken as any)).toThrow(new HttpError("FCM token must be a string", 422));
    });

    it("should validate FCM token be unsuccessfully in case of not existed", () => {
        expect(() => validateFCMToken(undefined as any)).toThrow(new HttpError("FCM token is required", 422));
    });
});