/**
 * @swagger
 * paths:
 *  /api/groups/create:
 *   post:
 *     summary: Create a group
 *     operationId: createGroup
 *     tags:
 *      - Groups
 *     security:
 *      - bearerAuth: []
 *     requestBody:
 *      required: true
 *      content:
 *       application/json:
 *        schema:
 *         type: object
 *         required:
 *          - name
 *         properties:
 *          name:
 *           type: string
 *           description: The name of the group
 *          picture:
 *           type: string
 *           description: url for group picture
 *          participants:
 *           type: array
 *           items:
 *            type: integer
 *           description: An array of participant IDs
 *          privacy:
 *           type: string
 *           description: The privacy level of the group (e.g., public, private)
 *          maxSize:
 *           type: integer
 *           description: The maximum number of participants allowed in the group
 *     responses:
 *       400:
 *        $ref: "#/components/responses/requestError"
 *       200:
 *         description: Data of successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                groupId:
 *                 type: integer
 *                 description: The ID of the created group
 */
