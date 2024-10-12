import { BlobServiceClient } from "@azure/storage-blob";
import { Readable } from "stream";
import dotenv from "dotenv";

// // Load environment variables from .env file
dotenv.config();

const BLOB_URL = process.env.BLOB_URL;
const CONTAINER_NAME = process.env.CONTAINER_NAME;

if (!BLOB_URL) {
    throw new Error("Azure Storage connection string is missing.");
}
if (!CONTAINER_NAME) {
    throw new Error("Container name is missing.");
}

// Initialize the BlobServiceClient and ContainerClient once, at the module level
const blobServiceClient = BlobServiceClient.fromConnectionString(BLOB_URL);
const containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME);

// Function to upload a file to Azure Blob Storage
const uploadBlob = async (
    filePath: string,
    blobName: string,
    metaData: Record<string, string>
): Promise<string> => {
    try {
        // Get a block blob client
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);

        // Upload the file
        await blockBlobClient.uploadFile(filePath, {
            metadata: metaData, // Set the metadata
        });
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
        // Get a block blob client
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);

        // Get the blob's properties to check if it exists
        const blobProperties = await blockBlobClient.getProperties();

        if (blobProperties) {
            console.log(`Blob "${blobName}" found. Retrieving...`);
            const downloadBlockBlobResponse = await blockBlobClient.download(0); // Start downloading from the beginning
            const readableStream = downloadBlockBlobResponse.readableStreamBody; // This is a Readable Stream
            if (readableStream) {
                return readableStream as unknown as Readable; // Cast to Node.js Readable
            }
        }
    } catch (error) {
        const errorMessage =
            (error as Error).message || "Unknown error occurred during blob retrieval";
        console.error("Error retrieving blob:", errorMessage);
        throw new Error("Error retrieving blob: " + errorMessage);
    }

    return null; // Return null if the blob does not exist
};

export { uploadBlob, retrieveBlob };
