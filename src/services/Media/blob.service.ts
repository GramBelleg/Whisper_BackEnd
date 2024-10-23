import {
    BlobServiceClient,
    BlobSASPermissions,
    generateBlobSASQueryParameters,
    StorageSharedKeyCredential,
} from "@azure/storage-blob";
import { Readable } from "stream";
import dotenv from "dotenv";

// // Load environment variables from .env file
dotenv.config();

const BLOB_URL = process.env.BLOB_URL;
const CONTAINER_NAME = process.env.CONTAINER_NAME;
const ACCOUNT_NAME = process.env.ACCOUNT_NAME;
const ACCOUNT_KEY = process.env.ACCOUNT_KEY;

if (!BLOB_URL) {
    throw new Error("Azure Storage connection string is missing.");
}
if (!CONTAINER_NAME) {
    throw new Error("Container name is missing.");
}
if (!ACCOUNT_NAME) {
    throw new Error("Account name is missing.");
}
if (!ACCOUNT_KEY) {
    throw new Error("Key is missing.");
}

const blobServiceClient = BlobServiceClient.fromConnectionString(BLOB_URL);
const containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME);
const sharedKeyCredential = new StorageSharedKeyCredential(ACCOUNT_NAME, ACCOUNT_KEY);

const getPresignedUrl = async (blobName: string, action: "read" | "write") => {
    const expiryTime = new Date(new Date().valueOf() + 60 * 60 * 1000 * 24 * 10); //remove 24*10 only for testing

    const permissions = new BlobSASPermissions();
    if (action == "write") {
        permissions.create = true;
        permissions.write = true;
    } else permissions.read = true;

    const sasToken = generateBlobSASQueryParameters(
        {
            containerName: CONTAINER_NAME,
            blobName,
            permissions,
            expiresOn: expiryTime,
        },
        sharedKeyCredential
    ).toString();

    const presignedUrl = `https://${ACCOUNT_NAME}.blob.core.windows.net/${CONTAINER_NAME}/${blobName}?${sasToken}`;
    return presignedUrl;
};

const uploadBlob = async (file: string, blobName: string): Promise<string> => {
    try {
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);

        await blockBlobClient.uploadFile(file);
        console.log(`Blob "${blobName}" uploaded successfully`);

        return `Blob "${blobName}" uploaded successfully`;
    } catch (error) {
        const errorMessage =
            (error as Error).message || "Unknown error occurred during blob upload";
        throw new Error("Error uploading blob: " + errorMessage);
    }
};

const retrieveBlob = async (blobName: string): Promise<Readable | null> => {
    try {
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);

        const blobProperties = await blockBlobClient.getProperties();

        if (blobProperties) {
            console.log(`Blob "${blobName}" found. Retrieving...`);
            const downloadBlockBlobResponse = await blockBlobClient.download(0);
            const readableStream = downloadBlockBlobResponse.readableStreamBody;
            if (readableStream) {
                return readableStream as unknown as Readable;
            }
        }
    } catch (error) {
        const errorMessage =
            (error as Error).message || "Unknown error occurred during blob retrieval";
        console.error("Error retrieving blob:", errorMessage);
        throw new Error("Error retrieving blob: " + errorMessage);
    }

    return null;
};

const deleteBlob = async (blobName: string): Promise<string> => {
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    try {
        await blockBlobClient.delete();
        console.log(`blob ${blobName} deleted successfully`);
        return `blob ${blobName} deleted successfully`;
    } catch (error) {
        const errorMessage =
            (error as Error).message || "Unknown error occurred during blob deletion";
        throw new Error("Error deleting blob: " + errorMessage);
    }
};

export { uploadBlob, retrieveBlob, deleteBlob, getPresignedUrl };
