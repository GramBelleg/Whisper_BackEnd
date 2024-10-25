/**
 * @swagger
 * paths:
 *  /api/groups/delete:
 *   post:
 *     summary: Delete a group
 *     operationId: deleteGroup
 *     tags:
 *      - Groups
 *     security:
 *      - bearerAuth: []
 *     parameters:
 *      - in: query
 *        name: groupId
 *        required: true
 *        schema:
 *          type: integer
 *     responses:
 *       400:
 *        $ref: "#/components/responses/requestError"
 *       200:
 *         description: Group deleted successfully
 */
