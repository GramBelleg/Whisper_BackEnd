import { updateName } from '@src/services/user/user.service';
import db from '@src/prisma/PrismaClient';
import { User } from '@prisma/client';
import { createRandomUser } from '@src/services/auth/prisma/create.service';

describe('updateName', () => {
    let user: User;
    let id: number;
    const newName = 'Updated Name';

    beforeAll(async () => {
        user = await createRandomUser();
        id = user.id;
    });

    afterEach(async () => {
        await db.user.update({
            where: { id },
            data: { name: user.name },
        });
    });

    afterAll(async () => {
        await db.user.delete({ where: { id } });
        await db.$disconnect();
    });

    it('should update the name and return the new name', async () => {
        const result = await updateName(id, newName);

        const updatedUser = await db.user.findUnique({ where: { id } });

        expect(updatedUser?.name).toBe(newName);
        expect(result).toBe(newName);
    });

    it('should throw an error if the user does not exist', async () => {
        const nonExistentId = 999999;
        await expect(updateName(nonExistentId, newName)).rejects.toThrow('Unable to update name');
    });

    it('should throw an error if the name is not provided', async () => {
        await expect(updateName(id, '')).rejects.toThrow('Name is required');
    });
});
