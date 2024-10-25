/**
 * @swagger
 * paths:
 *  /api/auth/signup:
 *   post:
 *     summary: Try to signup new user in the application
 *     operationID: SignUp
 *     tags:
 *      - Authentication - Registration
 *     requestBody:
 *      required: true
 *      content:
 *       application/json:
 *        schema:
 *         type: object
 *         required:
 *          - name
 *          - userName
 *          - email
 *          - phoneNumber
 *          - password
 *          - confirmPassword
 *          - robotToken
 *         properties:
 *          name:
 *           type: string
 *           minLength: 6
 *           maxLength: 50
 *          userName:
 *           type: string
 *           minLength: 6
 *           maxLength: 50
 *          email:
 *           type: string
 *           format: email
 *          phoneNumber:
 *           type: string
 *           pattern: /^\+[0-9\-\s]+$/
 *           description: start with + and allow only numbers and - and white spaces
 *          password:
 *           type: string
 *           format: password
 *           minLength: 6 characters
 *           maxLength: 50 characters
 *          confirmPassword:
 *           type: string
 *           format: password
 *           description: the same password for confirmation
 *          robotToken:
 *           type: string
 *           description: the token from recaptcha (I am not robot)
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
 *                userData:
 *                 type: object
 *                 properties:
 *                  name:
 *                   type: string
 *                  email:
 *                   type: string
 *                   format: email
 *
 */