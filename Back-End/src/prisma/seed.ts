import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";
import { User, Chat, ChatMessage, ChatParticipant } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

// Passwords and phone numbers of 5 users in order. 
const passwords: string[] = ['abcdefg', '1234567', 'aaaabbb', '1111111', '2222222'];
const phone_numbers: string[] = ['01111111111', '01045972201', '01266687540', '01222245798', '01000045873'];

// Utility function to create random users
async function createUsers(numUsers: number) {
    const users: User[] = [];
    for (let i = 0; i < numUsers; i++) {
        const user = await prisma.user.create({
            data: {
                email: faker.internet.email(),
                name: faker.person.fullName(),
                phone_number: phone_numbers[i],
                password: bcrypt.hashSync(passwords[i], 10),
                email_status: faker.helpers.arrayElement(["Activated", "Deactivated"]),
            },
        });
        users.push(user);
    }
    return users;
}

// Utility function to create random chats
async function createChats(numChats: number, users: any[]) {
    const chats = [];
    for (let i = 0; i < numChats; i++) {
        const chat = await prisma.chat.create({
            data: {
                lastActivity: faker.date.recent(),
            },
        });

        // Randomly select participants for this chat
        const participants = faker.helpers.arrayElements(users, 2); // Pick 2 random users

        // Add participants to chat
        for (const user of participants) {
            await prisma.chatParticipant.create({
                data: {
                    chatId: chat.id,
                    userId: user.id,
                },
            });
        }

        chats.push({ chat, participants });
    }
    return chats;
}

// Utility function to create messages for chats
async function createChatMessages(chats: any[]) {
    for (const chat of chats) {
        const numMessages = faker.number.int({ min: 1, max: 10 }); // Random number of messages per chat

        for (let i = 0; i < numMessages; i++) {
            const sender: User = faker.helpers.arrayElement(chat.participants); // Randomly pick a sender
            const message = await prisma.chatMessage.create({
                data: {
                    content: faker.lorem.sentence(),
                    senderId: sender.id,
                    createdAt: faker.date.recent(),
                    chatId: chat.chat.id,
                },
            });
        }
    }
}

// Main function to orchestrate the seeding
async function main() {
    const numUsers = 5; // Number of users to create
    const numChats = 3; // Number of chats to create

    // Step 1: Create Users
    const users = await createUsers(numUsers);
    console.log(`Created ${users.length} users.`);

    // Step 2: Create Chats
    const chats = await createChats(numChats, users);
    console.log(`Created ${chats.length} chats.`);

    // Step 3: Create Messages for each chat
    await createChatMessages(chats);
    console.log("Created messages for all chats.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
