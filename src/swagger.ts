import swaggerJsDoc from "swagger-jsdoc";
/**
 * @swagger
 * components:
 *   securitySchemes:
 *    cookieAuth:
 *     type: apiKey
 *     in: cookie
 *     name: token
 *   schemas:
 *    Error:
 *     type: object
 *     properties:
 *      status:
 *       type: string
 *       default: "failed"
 *      message:
 *       type: string
 *       description: message described the reason of the error
 *   responses:
 *    requestError:
 *       content:
 *        application/json:
 *         schema:
 *          $ref: "#/components/schemas/Error"
 *
 *
 * @swagger
 *  tags:
 *    - Authentication - Registration
 *    - User
 */

const swaggerSpec = swaggerJsDoc({
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Chat App API",
            version: "1.0.0",
            description: "Documentation for our chat app API",
        },
    },
    apis: [
        `${__dirname}/docs/swagger/*/*.js`,
        `${__dirname}/docs/swagger/*/*.ts`,
        `${__dirname}/swagger.js`,
        `${__dirname}/swagger.ts`,
    ],
});

export default swaggerSpec;
