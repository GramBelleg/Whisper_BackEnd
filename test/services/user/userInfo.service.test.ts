import { userInfo } from '@src/services/user/user.service';
import db from '@src/prisma/PrismaClient';
import { User } from '@prisma/client';
import { createRandomUser } from '@src/services/auth/prisma/create.service';

describe('userInfo', () => {
    let user: User;
    let id: number;

    beforeAll(async () => {
        user = await createRandomUser();
        id = user.id;
    });

    afterAll(async () => {
        await db.user.delete({ where: { id } });
        await db.$disconnect();
    });

    it('should return user info when user exists', async () => {
        const result = await userInfo(id);

        expect(result).toHaveProperty('name');
        expect(result).toHaveProperty('userName');
        expect(result).toHaveProperty('email');
        expect(result).toHaveProperty('bio');
        expect(result).toHaveProperty('profilePic');
        expect(result).toHaveProperty('lastSeen');
        expect(result).toHaveProperty('status');
        expect(result).toHaveProperty('phoneNumber');
        expect(result).toHaveProperty('autoDownloadSize');
        expect(result).toHaveProperty('readReceipts');
        expect(result).toHaveProperty('storyPrivacy');
        expect(result).toHaveProperty('pfpPrivacy');
        expect(result).toHaveProperty('lastSeenPrivacy');
    });

    it('should throw an error if user does not exist', async () => {
        const nonExistentId = 999999;
        await expect(userInfo(nonExistentId)).rejects.toThrow('User not found');
    });
});
