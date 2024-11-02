import axios from "axios";


async function fetchRobotTokenData(robotToken: string) {
    const verificationURL = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.reCAPTCHA_SECRET}&response=${robotToken}`;
    const response = await axios.post(verificationURL);
    console.log("response", response.data);
    return response.data;
}

export { fetchRobotTokenData };