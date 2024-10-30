import { Request, Response } from "express";
import { getPresignedUrl } from "@services/media1/blob.service";

const writeBlob = async (req: Request, res: Response) => {
    try {
        const fileExtension = req.body.fileExtension;
        const userId = req.userId;
        const blobName = `${userId}${Date.now()}.${fileExtension}`;
        const presignedUrl = await getPresignedUrl(blobName, "write");

        //save blobName in the media of the message on the frontend
        res.json({ presignedUrl, blobName });
    } catch (error) {
        console.error("Error generating presigned URL:", error);
        res.status(500).send("Error generating presigned URL.");
    }
};

const readBlob = async (req: Request, res: Response) => {
    //blobName represents the media of the message for the frontend
    const blobName = req.body.blobName;
    try {
        const presignedUrl = await getPresignedUrl(blobName, "read");
        res.json({ presignedUrl });
    } catch (error) {
        console.error("Error generating presigned URL:", error);
        res.status(500).send("Error generating presigned URL.");
    }
};

export { writeBlob, readBlob };
