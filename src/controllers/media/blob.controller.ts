import { Request, Response } from "express";
import { getPresignedUrl } from "@services/media/blob.service";

const writeBlob = async (req: Request, res: Response) => {
    try {
        // Generate a presigned URL for uploading
        const blobName = `${Date.now()}.webm`;
        const presignedUrl = await getPresignedUrl(blobName, "write");
        res.json({ presignedUrl, blobName });
    } catch (error) {
        console.error("Error generating presigned URL:", error);
        res.status(500).send("Error generating presigned URL.");
    }
};

const readBlob = async (req: Request, res: Response) => {
    const blobName = req.body.blobName;
    try {
        // Generate a presigned URL for streaming
        const presignedUrl = await getPresignedUrl(blobName, "read");
        res.json({ presignedUrl });
    } catch (error) {
        console.error("Error generating presigned URL:", error);
        res.status(500).send("Error generating presigned URL.");
    }
};

export { writeBlob, readBlob };
