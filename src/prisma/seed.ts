import { faker } from "@faker-js/faker";
import { User } from "@prisma/client";
import bcrypt from "bcrypt";
import db from "./PrismaClient";

// Passwords of 5 users in order.
const passwords: string[] = ["abcdefgh", "12345678", "aaaabbbb", "1111111", "22222222"];

// Utility function to create random users
async function createUsers(numUsers: number) {
    const users: User[] = [];
    for (let i = 0; i < numUsers; i++) {
        const user = await db.user.create({
            data: {
                email: faker.internet.email(),
                userName: faker.internet.userName(),
                name: faker.person.fullName(),
                password: bcrypt.hashSync(passwords[i], 10),
                bio: faker.lorem.sentence(),
                phoneNumber: faker.phone.number({ style: "international" }),
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
        const chat = await db.chat.create({
            data: {
                type: "DM",
            },
        });

        // Randomly select participants for this chat
        const participants = faker.helpers.arrayElements(users, 2); // Pick 2 random users

        // Add participants to chat
        for (const user of participants) {
            await db.chatParticipant.create({
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
            const message = await db.message.create({
                data: {
                    content: faker.lorem.sentence(),
                    senderId: sender.id,
                    createdAt: faker.date.recent(),
                    chatId: chat.chat.id,
                    type: "TEXT",
                },
            });

            // Loop over every participant except the sender
            for (const participant of chat.participants) {
                // Skip the sender
                await db.messageStatus.create({
                    data: {
                        messageId: message.id,
                        userId: participant.id, // Add status for each other participant
                        read: faker.date.recent(),
                        delivered: faker.date.recent(),
                        deleted: faker.datatype.boolean(),
                    },
                });
            }

        }
    }
}

// Main function to implement the seeding
async function main() {
    const numUsers = 5;
    const numChats = 3;

    //Create Users
    const users = await createUsers(numUsers);
    console.log(`Created ${users.length} users.`);

    //Create Chats
    const chats = await createChats(numChats, users);
    console.log(`Created ${chats.length} chats.`);

    //Create Messages for each chat
    await createChatMessages(chats);
    console.log("Created messages for all chats.");
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
