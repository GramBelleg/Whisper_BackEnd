import { changeUserName } from '@src/services/user/user.service';
import db from '@src/prisma/PrismaClient';
import { User } from '@prisma/client';
import { createRandomUser } from '@src/services/auth/prisma/create.service';

describe('changeUserName', () => {
    let user1: User;
    let user2: User;

    let userName1: string;
    let userName2: string;

    const newUserName = 'NewUserName';

    beforeAll(async () => {
        user1 = await createRandomUser();
        user2 = await createRandomUser();
        userName1 = user1.userName;
        userName2 = user2.userName;
    });

    afterEach(async () => {
        await db.user.update({
            where: { id: user1.id },
            data: { userName: userName1 },
        });
    });

    afterAll(async () => {
        await db.user.delete({ where: { id: user1.id } });
        await db.user.delete({ where: { id: user2.id } });
        await db.$disconnect();
    });

    it('should update the username and return the new username', async () => {
        const result = await changeUserName(user1.id, newUserName);

        const updatedUser = await db.user.findUnique({ where: { id: user1.id } });

        expect(updatedUser?.userName).toBe(newUserName);
        expect(result).toBe(newUserName);
    });

    it('should throw an error if the username is not provided', async () => {
        await expect(changeUserName(user1.id, '')).rejects.toThrow('Username is required');
    });

    it('should throw an error if the username is already taken', async () => {
        await expect(changeUserName(user1.id, user2.userName)).rejects.toThrow('Username is already taken');
    });
});