/**
 * @swagger
 * paths:
 *  /api/admin/filter:
 *   get:
 *     summary: apply content filter to group
 *     operationId: filter
 *     tags:
 *      - Admin
 *     security:
 *      - bearerAuth: []
 *     requestBody:
 *      required: true
 *      content:
 *       application/json:
 *        schema:
 *         type: object
 *         required:
 *          - grouopId
 *         properties:
 *          groupId:
 *           type: integer
 *     responses:
 *       400:
 *         $ref: "#/components/responses/requestError"
 *       200:
 *         description: content filter applied user successfully
 */
