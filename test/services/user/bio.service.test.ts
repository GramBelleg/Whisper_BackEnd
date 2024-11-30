import { updateBio } from '@src/services/user/user.service';
import db from "@src/prisma/PrismaClient";
import { User } from "@prisma/client";
import { createRandomUser } from '@src/services/auth/prisma/create.service';


describe('updateBio', () => {
    let user: User;
    let id: number;
    const bio = 'This is my new bio';

    beforeAll(async () => {
        user = await createRandomUser();
        id = user.id;
    });

    afterEach(async () => {        
        await db.user.update({
            where: { id },
            data: { bio: '' },
        });
    });

    afterAll(async () => {
        await db.user.delete({ where: { id } });
        await db.$disconnect();
    });

    it('should update the bio and return the new bio', async () => {
        const result = await updateBio(id, bio);

        const updatedUser = await db.user.findUnique({ where: { id } });

        expect(updatedUser?.bio).toBe(bio);
        expect(result).toBe(bio);
    });

    it('should throw an error if the user does not exist', async () => {
        const nonExistentId = 999999;
        await expect(updateBio(nonExistentId, bio)).rejects.toThrow('Unable to update bio');
    });
});
