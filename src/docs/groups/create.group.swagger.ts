/**
 * @swagger
 * paths:
 *  /api/groups/create:
 *   post:
 *     summary: create a group
 *     operationID: creatGroup
 *     tags:
 *      - Groups
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
 *           format: name
 *          name:
 *           type: string
 *           format: name
 *          name:
 *           type: string
 *           format: name
 *     responses:
 *       400:
 *        $ref: "#/components/responses/requestError"
 *       200:
 *         description: data of successful response
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                status:
 *                 type: string
 *                userToken:
 *                 type: string
 *                user:
 *                 type: object
 *                 properties:
 *                  id:
 *                   type: integer
 *                  name:
 *                   type: string
 *                  userName:
 *                   type: string
 *                  email:
 *                   type: string
 *                   format: email
 */
