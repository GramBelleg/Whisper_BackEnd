import { Request, Response } from "express";
import { uploadBlob, retrieveBlob } from "@services/Media/blob.service";
import fs from "fs";

const uploadAudio = async (req: Request, res: Response) => {
    if (!req.file) {
        console.log("no file");
        return res.status(400).send("No audio file uploaded.");
    }
    const audioFile = req.file;
    const blobName = `${Date.now()}.webm`;

    try {
        // Upload the recorded audio file to Azure Blob Storage
        await uploadBlob(audioFile.path, blobName);
        res.json({ blobName });
    } catch (error) {
        console.error("Error uploading blob:", error);
        res.status(500).send("Error uploading audio file.");
    }
};

const streamAudio = async (req: Request, res: Response) => {
    const blobName = req.params.blobName;
    console.log(blobName);
    try {
        const blobStream = await retrieveBlob(blobName);

        if (!blobStream) {
            res.status(404).send("Audio file not found");
            return;
        }

        blobStream.pipe(res);
    } catch (error) {
        console.error("Error streaming audio:", error);
        res.status(500).send("Error streaming audio");
    }
};

export { uploadAudio, streamAudio };
