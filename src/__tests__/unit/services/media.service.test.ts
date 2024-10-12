// tests/unit/services/blobService.test.ts
import { BlobServiceClient } from "@azure/storage-blob";
import { Readable } from "stream";
import { uploadBlob, retrieveBlob } from "../../../services/media.service"; // Adjust the import path as necessary

// Mocking the Azure Storage Blob client
jest.mock("@azure/storage-blob");

const mockBlobServiceClient = {
    getContainerClient: jest.fn(),
};

const mockContainerClient = {
    getBlockBlobClient: jest.fn(),
};

const mockBlockBlobClient = {
    uploadFile: jest.fn(),
    download: jest.fn(),
    getProperties: jest.fn(),
};

// Setup the mocked implementations before each test
beforeEach(() => {
    (BlobServiceClient.fromConnectionString as jest.Mock).mockReturnValue(mockBlobServiceClient);
    mockBlobServiceClient.getContainerClient.mockReturnValue(mockContainerClient);
    mockContainerClient.getBlockBlobClient.mockReturnValue(mockBlockBlobClient);
});

describe("Blob Service", () => {
    describe("uploadBlob", () => {
        it("should upload blob successfully", async () => {
            mockBlockBlobClient.uploadFile.mockResolvedValueOnce({}); // Simulate successful upload

            const filePath = "path/to/file.txt";
            const blobName = "file.txt";
            const metaData = { key: "value" };

            const result = await uploadBlob(filePath, blobName, metaData);

            expect(mockBlockBlobClient.uploadFile).toHaveBeenCalledWith(filePath, {
                metadata: metaData,
            });
            expect(result).toBe(`Blob "${blobName}" uploaded successfully`);
        });

        it("should throw an error if upload fails", async () => {
            mockBlockBlobClient.uploadFile.mockRejectedValueOnce(new Error("Upload failed"));

            const filePath = "path/to/file.txt";
            const blobName = "file.txt";
            const metaData = { key: "value" };

            await expect(uploadBlob(filePath, blobName, metaData)).rejects.toThrow(
                "Error uploading blob: Upload failed"
            );
        });
    });

    describe("retrieveBlob", () => {
        it("should retrieve blob successfully", async () => {
            const mockReadableStream = new Readable();
            mockBlockBlobClient.getProperties.mockResolvedValueOnce({}); // Simulate properties retrieval
            mockBlockBlobClient.download.mockResolvedValueOnce({
                readableStreamBody: mockReadableStream,
            });

            const blobName = "file.txt";

            const result = await retrieveBlob(blobName);

            expect(mockBlockBlobClient.getProperties).toHaveBeenCalled();
            expect(mockBlockBlobClient.download).toHaveBeenCalledWith(0);
            expect(result).toBe(mockReadableStream);
        });

        it("should return null if blob does not exist", async () => {
            mockBlockBlobClient.getProperties.mockRejectedValueOnce(new Error("Blob not found"));

            const blobName = "non-existing-file.txt";

            const result = await retrieveBlob(blobName);

            expect(result).toBeNull();
        });

        it("should throw an error if retrieval fails", async () => {
            mockBlockBlobClient.getProperties.mockResolvedValueOnce({}); // Simulate properties retrieval
            mockBlockBlobClient.download.mockRejectedValueOnce(new Error("Download failed"));

            const blobName = "file.txt";

            await expect(retrieveBlob(blobName)).rejects.toThrow(
                "Error retrieving blob: Download failed"
            );
        });
    });
});
