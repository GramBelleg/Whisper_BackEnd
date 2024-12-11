import { User } from "@prisma/client";

export type UserInfo = {
    email: string;
    userName: string;
    phoneNumber: string;
    password: string;
    name: string;
};

export type DuplicateUserInfo = {
    email?: string;
    userName?: string;
    phoneNumber?: string;
};

export type SenderInfo = Pick<User, "id" | "userName" | "profilePic">;

export type UserType = {
    id: number;
    userName?: string;
    profilePic?: string;
};
