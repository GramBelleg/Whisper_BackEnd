/**
 * @swagger
 * paths:
 *  /api/auth/google:
 *   post:
 *     summary: Login option using google api
 *     operationID: Google login
 *     tags:
 *      - Authentication - Registration
 *     requestBody:
 *      required: true
 *      content:
 *       application/json:
 *        schema:
 *         type: object
 *         required:
 *          - code
 *         properties:
 *          code:
 *           type: string
 *           description: resulted code from google login in client-side
 *     responses:
 *       400:
 *        $ref: "#/components/responses/requestError"
 *       200:
 *         description: data of successful response
 *         content:
 *           application/json:
 *             schema:
 *              properties:
 *               status:
 *                type: string
 *               user:
 *                type: object
 *                properties:
 *                 id:
 *                  type: integer
 *                 name:
 *                  type: string
 *                 email:
 *                  type: string
 *                  format: email
 *              userToken:
 *               type: string
 *               description: token which will be used in authentication inside application
 *
 *  /api/auth/facebook:
 *   post:
 *     summary: Login option using facebook api
 *     operationID: Facebook login
 *     tags:
 *      - Authentication - Registration
 *     requestBody:
 *      required: true
 *      content:
 *       application/json:
 *        schema:
 *         type: object
 *         required:
 *          - code
 *         properties:
 *          code:
 *           type: string
 *           description: resulted code from facebook login in client-side
 *     responses:
 *       400:
 *        $ref: "#/components/responses/requestError"
 *       200:
 *         description: data of successful response
 *         content:
 *           application/json:
 *             schema:
 *              properties:
 *               status:
 *                type: string
 *               user:
 *                type: object
 *                properties:
 *                 id:
 *                  type: integer
 *                 name:
 *                  type: string
 *                 userName:
 *                  type: string
 *                 email:
 *                  type: string
 *                  format: email
 *              userToken:
 *               type: string
 *               description: token which will be used in authentication inside application
 *
 *  /api/auth/github:
 *   post:
 *     summary: Login option using github api
 *     operationID: Github login
 *     tags:
 *      - Authentication - Registration
 *     requestBody:
 *      required: true
 *      content:
 *       application/json:
 *        schema:
 *         type: object
 *         required:
 *          - code
 *         properties:
 *          code:
 *           type: string
 *           description: resulted code from github login in client-side
 *     responses:
 *       400:
 *        $ref: "#/components/responses/requestError"
 *       200:
 *         description: data of successful response
 *         content:
 *           application/json:
 *             schema:
 *              properties:
 *               status:
 *                type: string
 *               user:
 *                type: object
 *                properties:
 *                 id:
 *                  type: integer
 *                 name:
 *                  type: string
 *                 userName:
 *                  type: string
 *                 email:
 *                  type: string
 *                  format: email
 *              userToken:
 *               type: string
 *               description: token which will be used in authentication inside application
 *
 */ 
