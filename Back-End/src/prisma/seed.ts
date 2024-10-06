import db from "./PrismaClient";
import bcrypt from "bcrypt";

const Email_verified: { Activated: string; Deactivated: string } = {
    Activated: "Activated",
    Deactivated: "Deactivated",
};

interface User {
    name: string;
    email: string;
    password: string;
    email_status: string;
}
interface Message {
    content: string;
    from_user_id: number;
    to_user_id: number;
}

const user_data: User[] = [
    {
        name: "omar",
        email: "omar@gmail.com",
        password: bcrypt.hashSync("123456", 10),
        email_status: "Activated",
    },
    {
        name: "amr",
        email: "amr@gmail.com",
        password: bcrypt.hashSync("123456", 10),
        email_status: "Activated",
    },
];

async function main() {
    await db.user.createMany({
        data: user_data,
        skipDuplicates: true,
    });
}

main();
