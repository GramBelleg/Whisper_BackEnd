import swaggerJsDoc from "swagger-jsdoc";
/**
 * @swagger
 * components:
 *   schemas:
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
    `${__dirname}/routes/*.js`,
    `${__dirname}/routes/*.ts`,
    `${__dirname}/swagger.js`,
    `${__dirname}/swagger.ts`,
  ],
});

export default swaggerSpec;
