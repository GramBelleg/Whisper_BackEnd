import { Request, Response } from "express";
import { getPresignedUrl } from "@services/Media/blob.service";

const uploadAudio = async (req: Request, res: Response) => {
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

const streamAudio = async (req: Request, res: Response) => {
    const blobName = req.params.blobName;
    try {
        // Generate a presigned URL for streaming
        const presignedUrl = await getPresignedUrl(blobName, "read");
        res.json({ presignedUrl });
    } catch (error) {
        console.error("Error generating presigned URL:", error);
        res.status(500).send("Error generating presigned URL.");
    }
};

export { uploadAudio, streamAudio };
