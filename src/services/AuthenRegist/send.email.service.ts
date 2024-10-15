import transporter from "@config/email.config";

const sendEmail = async (code: string, email: string): Promise<string | undefined> => {
    try {
        const email_body: string = `
            <h3>Hello from Omar,</h3>
            <p>Thanks for joining our family. Use this code: <b>${code}</b> to verify your email.</p>
        `;

        // Send email
        await transporter.sendMail({
            from: process.env.AUTH_EMAIL,
            to: email,
            subject: "Email Verification",
            html: email_body,
        });

        return "Verification email sent successfully.";
    } catch (error) {
        console.error("Error sending email:", error);
        return undefined;
    }
};

export default sendEmail;
