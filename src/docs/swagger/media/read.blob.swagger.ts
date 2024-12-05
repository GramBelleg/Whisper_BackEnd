/**
 * @swagger
 * paths:
 *  /api/blob/read:
 *   post:
 *     summary: Generate a presigned URL for reading a blob
 *     operationId: readBlob
 *     tags:
 *      - Media
 *     security:
 *      - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               blobName:
 *                 type: string
 *                 description: The name of the blob to read.
 *             required:
 *               - blobName
 *     responses:
 *       400:
 *         $ref: "#/components/responses/requestError"
 *       200:
 *         description: Presigned URL for reading a blob
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 presignedUrl:
 *                   type: string
 *                   description: The presigned URL to download the blob.
 *       500:
 *         description: Error generating presigned URL
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 */
