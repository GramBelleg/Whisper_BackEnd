import { updateEmail } from '@src/services/user/user.service';
import db from '@src/prisma/PrismaClient';
import { User } from '@prisma/client';
import { createRandomUser } from '@src/services/auth/prisma/create.service';
import { verifyCode } from '@src/services/auth/code.service';

jest.mock('@services/auth/code.service');

describe('updateEmail', () => {
    let user: User;
    let id: number;
    const newEmail = 'test@test.com';

    beforeAll(async () => {
        user = await createRandomUser();
        id = user.id;
    });

    afterEach(async () => {
        await db.user.update({
            where: { id },
            data: { name: user.email },
        });
        jest.clearAllMocks();
    });

    afterAll(async () => {
        await db.user.delete({ where: { id } });
        await db.$disconnect();
    });

    it('should update the email and return the email', async () => {
        (verifyCode as jest.Mock).mockResolvedValueOnce(undefined);
        const result = await updateEmail(id, newEmail, "testCode");

        const updatedUser = await db.user.findUnique({ where: { id } });

        expect(updatedUser?.email).toBe(newEmail);
        expect(result).toBe(newEmail);
    });

    it('should throw an error if the user does not exist', async () => {
        (verifyCode as jest.Mock).mockResolvedValueOnce(undefined);
        const nonExistentId = 999999;
        await expect(updateEmail(nonExistentId, newEmail, "testCode")).rejects.toThrow('Unable to update email');
    });

    it('should throw an error if the email is not provided', async () => {
        await expect(updateEmail(id, "","testCode")).rejects.toThrow('Email is required');
    });
});
