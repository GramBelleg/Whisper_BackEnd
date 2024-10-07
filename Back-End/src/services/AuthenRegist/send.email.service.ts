import transporter from "@config/email.config";

const sendEmail = async (code: string, email: string): Promise<string | undefined> => {
    try {
        const email_body: string = `<h3>Hello from Omar,</h3>
            <p>Thanks for joining our family. Use this code: <b>   ${code}     </b> for verifing your email</p>`;
        const info = await transporter.sendMail({
            from: process.env.AUTH_EMAIL,
            to: email,
            subject: "Email verfication",
            html: email_body,
        });
        return info;
    } catch (e: any) {
        console.log(e.message);
        return undefined;
    }
};

// module.exports = sendEmail;
export default sendEmail;
