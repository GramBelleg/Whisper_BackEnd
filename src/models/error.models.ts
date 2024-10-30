import { UserInfo } from "@models/user.models";

export type ErrorBody = {
    success: boolean;
    message: string;
    stack: string;
    duplicate?: UserInfo;
};
