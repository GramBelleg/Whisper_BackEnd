import { updatePhone } from '@src/services/user/user.service';
import db from "@src/prisma/PrismaClient";
import { User } from "@prisma/client";
import { createRandomUser } from '@src/services/auth/prisma/create.service';
import { validatePhoneNumber } from '@src/validators/auth';

jest.mock('@src/validators/auth');

describe('updatePhone', () => {
    let user: User;
    let user2: User;
    let id: number;
    const newPhoneNumber = '+201062029472';
    let existPhone: string;


    beforeAll(async () => {
        user = await createRandomUser();
        user2 = await createRandomUser();
        id = user.id;
        existPhone = user2.phoneNumber!;
    });

    afterAll(async () => {
        await db.user.delete({ where: { id } });
        await db.user.delete({ where: { id: user2.id } });
        await db.$disconnect();
    });

    it('should update the phone number and return the new phone number', async () => {
        (validatePhoneNumber as jest.Mock).mockReturnValue('+201062029472');

        const result = await updatePhone(id, newPhoneNumber);

        const updatedUser = await db.user.findUnique({ where: { id } });

        expect(updatedUser?.phoneNumber).toBe(newPhoneNumber);
        expect(result).toBe(newPhoneNumber);
    });

    it('should throw an error if the phone number already exists', async () => {
        (validatePhoneNumber as jest.Mock).mockReturnValue(true);
        await expect(updatePhone(id, existPhone)).rejects.toThrow('Unable to update phone');
    });

    it('should throw an error if the user does not exist', async () => {
        const nonExistentId = 999999;
        await expect(updatePhone(nonExistentId, newPhoneNumber)).rejects.toThrow('Unable to update phone');
    });
});
