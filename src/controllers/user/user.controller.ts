import { Request, Response } from "express";
import * as userServices from "@services/user/user.service";
import * as storyServices from "@services/story/story.service";
import { validateEmail } from "@validators/auth";
import { validateReadReceipt } from "@validators/user";
import { updateReadReceipt } from "@services/user/prisma/update.service";
import { findUserByEmail, findUserByUserName } from "@services/auth/prisma/find.service";
import { createCode, sendCode } from "@services/auth/code.service";
import RedisOperation from "@src/@types/redis.operation";
import HttpError from "@src/errors/HttpError";
import { MAX_UPLOAD_SIZE } from "@config/constants.config";
import { Privacy } from "@prisma/client";

const updateBio = async (req: Request, res: Response) => {
    let { bio }: { bio: string } = req.body;
    if (!bio) 
        throw new HttpError("Bio not specified", 404);
    let id: number = req.userId;
    await userServices.updateBio(id, bio);
    res.status(200).json({
        status: "success",
        data: bio,
    });
};

const updateName = async (req: Request, res: Response) => {
    let { name }: { name: string } = req.body;
    if (!name) 
        throw new HttpError("Name not specified", 404);
    let id: number = req.userId;
    await userServices.updateName(id, name);
    res.status(200).json({
        status: "success",
        data: name,
    });
};

const updateEmail = async (req: Request, res: Response) => {
    let { email, code}: { email: string; code: string } = req.body;
    if(!email || !code) throw new HttpError("Email or code not specified", 404);
    let id: number = req.userId;
    await userServices.updateEmail(id, email, code);
    res.status(200).json({
        status: "success",
        data: email,
    });
};

const emailCode = async (req: Request, res: Response): Promise<void> => {
    const { email } = req.body as Record<string, string>;
    validateEmail(email);

    const foundEmail = await findUserByEmail(email);
    if (foundEmail) throw new HttpError("Email already exists", 409);

    const codeExpiry = parseInt(process.env.CODE_EXPIRES_IN as string);
    const code = await createCode(email, RedisOperation.ConfirmEmail, codeExpiry);

    const emailBody = `<h3>Hello, </h3> <p>Thanks for joining our family. Use this code: <b>${code}</b> for verifing your email</p>`;
    await sendCode(email, "confirmation code", emailBody);

    res.status(200).json({
        status: "success",
    });
};

const updatePhone = async (req: Request, res: Response) => {
    let { phoneNumber = "" }: { phoneNumber: string } = req.body;
    let id: number = req.userId;
    let updatedPhone = await userServices.updatePhone(id, phoneNumber);
    res.status(200).json({
        status: "success",
        data: updatedPhone,
    });
};

const changePic = async (req: Request, res: Response) => {
    const id: number = req.userId;
    const blob = req.body.blobName;
    await userServices.changePic(id, blob);
    res.status(200).json({
        status: "success",
        name: blob,
    });
};

const userInfo = async (req: Request, res: Response) => {
    const user = await userServices.userInfo(req.userId);
    res.status(200).json({
        ...user,
    });
};
const otherUserInfo = async (req: Request, res: Response) => {
    const myId = req.userId;
    const userId: number = Number(req.params.userId);
    if (isNaN(userId)) throw new HttpError("Invalid userId", 400);
    const user = await userServices.partialUserInfo(myId, userId);
    res.status(200).json({
        ...user,
    });
};

const changeUserName = async (req: Request, res: Response) => {
    let { userName }: { userName: string } = req.body;
    if (!userName) 
        throw new HttpError("Username not specified", 404);
    let id: number = req.userId;
    await userServices.changeUserName(id, userName);
    res.status(200).json({
        status: "success",
        data: userName,
    });
};

const changeReadReceipt = async (req: Request, res: Response) => {
    validateReadReceipt(req.body.readReceipts);
    await updateReadReceipt(req.userId, req.body.readReceipts);
    res.status(200).json({
        status: "success",
        message: "Read receipts have been updated.",
    });
};

const changeAutoDownloadSize = async (req: Request, res: Response) => {
    const size = req.body.size;
    const userId = req.userId;
    if (size == undefined || size == null)
        throw new HttpError("Automatic Download Size not specified", 404);
    if (size > MAX_UPLOAD_SIZE) throw new HttpError("Invalid file size specified", 400);
    await userServices.changeAutoDownloadSize(userId, size);
    res.status(200).json({
        status: "success",
        message: "Automatic download size updated.",
    });
};
const changeLastSeenPrivacy = async (req: Request, res: Response) => {
    const privacyValue = req.body.privacy;
    const userId = req.userId;
    if (!privacyValue) throw new HttpError("Privacy not specified", 404);

    if (!(privacyValue in Privacy)) throw new HttpError("Invalid privacy setting", 400);
    const privacy: Privacy = privacyValue;

    await userServices.changeLastSeenPrivacy(userId, privacy);
    res.status(200).json({
        status: "success",
        message: "Privacy settings updated.",
    });
};
const changePfpPrivacy = async (req: Request, res: Response) => {
    const privacyValue = req.body.privacy;
    const userId = req.userId;
    if (!privacyValue) throw new HttpError("Privacy not specified", 404);

    if (!(privacyValue in Privacy)) throw new HttpError("Invalid privacy setting", 400);
    const privacy: Privacy = privacyValue;

    await userServices.changePfpPrivacy(userId, privacy);
    res.status(200).json({
        status: "success",
        message: "Privacy settings updated.",
    });
};
const changeStoryPrivacy = async (req: Request, res: Response) => {
    const privacyValue = req.body.privacy;
    const userId = req.userId;
    if (!privacyValue) throw new HttpError("Privacy not specified", 404);

    if (!(privacyValue in Privacy)) throw new HttpError("Invalid privacy setting", 400);
    const privacy: Privacy = privacyValue;

    await userServices.changeStoryPrivacy(userId, privacy);
    res.status(200).json({
        status: "success",
        message: "Privacy settings updated.",
    });
};

const addContact = async (req: Request, res: Response) => {
    const relatedByUserName = req.body.userName;
    const relatingId = req.userId;
    const relatedById = await findUserByUserName(relatedByUserName);
    if (!relatedById) throw new HttpError("No user specified to add", 404);

    await userServices.addContact(relatingId, relatedById);
    res.status(200).json({
        status: "success",
        message: "User added successfully.",
    });
};

const getStoryArchive = async (req: Request, res: Response) => {
    const userId = req.userId;
    const stories = await storyServices.getStoryArchive(userId);
    res.status(200).json({
        stories: stories,
    });
};

//TODO: api doc
const getStoryUsers = async (req: Request, res: Response) => {
    const userId = req.userId;
    const users = await storyServices.getStoryUsers(userId);
    res.status(200).json({
        users: users,
    });
};

//TODO: api doc
const getUserStories = async (req: Request, res: Response) => {
    const userId = req.userId;
    const storyUserId: number = Number(req.params.userId);
    const stories = await storyServices.getStoriesByUserId(userId, storyUserId);
    res.status(200).json({
        stories: stories,
    });
};
const getStoryViews = async (req: Request, res: Response) => {
    const storyId: number = Number(req.params.storyId);
    const users = await storyServices.getStoryViews(storyId);
    res.status(200).json({
        users,
    });
};

const updateAddPermission = async (req: Request, res: Response) => {
    const userId = req.userId;
    if (!userId) throw new HttpError("Unauthorized User", 401);
    const addPermission = req.body.addPermission;
    if (addPermission == undefined) throw new HttpError("addPermission missing", 404);
    if (typeof addPermission !== "boolean") throw new HttpError("Invalid addPermission", 400);
    await userServices.updateAddPermission(userId, addPermission);
    res.status(200).json({
        success: true,
        message: "Add To Group Permission Updated Successfully",
    });
};

const getContacts = async (req: Request, res: Response) => {
    const userId = req.userId;
    if (!userId) throw new HttpError("Unauthorized User", 401);
    const users = await userServices.getContacts(userId);
    res.status(200).json({users: users});
};
export {
    getContacts,
    updateAddPermission,
    userInfo,
    otherUserInfo,
    updateBio,
    updateName,
    updateEmail,
    emailCode,
    updatePhone,
    changePic,
    changeUserName,
    changeReadReceipt,
    changeAutoDownloadSize,
    changeLastSeenPrivacy,
    changePfpPrivacy,
    addContact,
    getStoryArchive,
    getStoryUsers,
    getUserStories,
    getStoryViews,
    changeStoryPrivacy,
};
