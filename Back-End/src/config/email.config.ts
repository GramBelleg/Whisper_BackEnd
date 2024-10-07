import nodemailer, { Transporter } from 'nodemailer';

/**
 * This is the configuration of object which send emails on gmail 
 */

const transporter: Transporter = nodemailer.createTransport({
    host: process.env.HOST_EMAIL as string,
    port: parseInt(process.env.PORT_EMAIL as string, 10),
    secure: true,
    auth: {
        user: process.env.AUTH_EMAIL as string,
        pass: process.env.EMAIL_PASSWORD as string
    }
});


export default transporter;