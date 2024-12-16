/**
 * @swagger
 * paths:
 *  /api/blob/write:
 *   post:
 *     summary: Generate a presigned URL for writing a blob
 *     operationId: writeBlob
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
 *               fileExtension:
 *                 type: string
 *                 description: The file extension of the blob (e.g., "jpg", "png").
 *             required:
 *               - fileExtension
 *     responses:
 *       400:
 *         $ref: "#/components/responses/requestError"
 *       200:
 *         description: Presigned URL for writing a blob
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 presignedUrl:
 *                   type: string
 *                   description: The presigned URL to upload the blob.
 *                 blobName:
 *                   type: string
 *                   description: The generated blob name with user ID and timestamp.
 *       500:
 *         description: Error generating presigned URL
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *
 */
