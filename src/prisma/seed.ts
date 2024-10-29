import { faker } from "@faker-js/faker";
import { Chat, ChatType, User } from "@prisma/client";
import bcrypt from "bcrypt";
import db from "./PrismaClient";

// Passwords of 5 users in order.
const passwords: string[] = ["abcdefgh", "12345678", "aaaabbbb", "1111111", "22222222"];

// Utility function to create random users
async function createUsers(numUsers: number) {
    const users: User[] = [];
    for (let i = 0; i < numUsers; i++) {
        const user: User = await db.user.create({
            data: {
                email: faker.internet.email().toLowerCase(),
                userName: faker.internet.userName().toLowerCase(),
                name: faker.person.fullName().toLowerCase(),
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
    const chats: Array<{ chat: Chat; participants: User[] }> = [];
    for (let i = 0; i < numChats; i++) {
        const chat: Chat = await db.chat.create({
            data: {
                type: ChatType.DM,
            },
        });

        // Randomly select participants for this chat
        const participants: User[] = faker.helpers.arrayElements(users, 2); // Pick 2 random users

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
async function createChatMessages(chats: Array<{ chat: Chat; participants: User[] }>) {
    for (const chat of chats) {
        const numMessages = faker.number.int({ min: 1, max: 10 }); // Random number of messages per chat

        for (let i = 0; i < numMessages; i++) {
            const sender: User = faker.helpers.arrayElement(chat.participants); // Randomly pick a sender
            const message = await db.message.create({
                data: {
                    content: faker.lorem.sentence(),
                    senderId: sender.id,
                    sentAt: faker.date.recent(),
                    chatId: chat.chat.id,
                    type: "TEXT",
                },
            });

            // Loop over every participant except the sender
            for (const participant of chat.participants) {
                // Skip the sender

                await db.messageStatus.create({
                    data: {
                        messageId: message.id, // Use the message ID
                        userId: participant.id, // Ensure the participant's userId is used
                        read: faker.date.recent(),
                        time: faker.date.recent(),
                        delivered: faker.date.recent(),
                        deleted: faker.datatype.boolean(),
                    },
                });

                // Update the chat with the created message
                await db.chatParticipant.update({
                    where: { chatId_userId: { chatId: chat.chat.id, userId: participant.id } },
                    data: {
                        lastMessageId: message.id,
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
