// src/__tests__/unit/services/media.service.test.ts
import { uploadBlob, deleteBlob, retrieveBlob } from "@services/Media/blob.service";
import { Readable } from "stream";
import dotenv from "dotenv";

dotenv.config();
describe("Azure Blob Storage (Actual) Tests", () => {
    const testBlobName = `test-blob-${Date.now()}`;
    const testFilePath = "./src/__tests__/unit/services/media/test.txt"; // Path to a test file

    it("should upload a blob to Azure Blob Storage", async () => {
        // Perform the actual upload
        const result = await uploadBlob(testFilePath, testBlobName);

        // Verify the result
        expect(result).toContain(testBlobName);
    });

    it("should download blob from Azure Blob Storage", async () => {
        // Perform the actual upload
        const blobStream = await retrieveBlob(testBlobName);

        // Verify the result
        expect(blobStream).toBeInstanceOf(Readable);
    });

    it("should delete blob from Azure Blob Storage", async () => {
        // Perform the actual upload
        const result = await deleteBlob(testBlobName);

        // Verify the result
        expect(result).toContain(testBlobName);
    });
});
