import { updatePassword } from "@services/prisma/update.service";
import { createRandomUser } from "@src/services/prisma/create.service";
import { faker } from "@faker-js/faker";
import bcrypt from "bcrypt";


// afterEach(async () => {
//     await db.user.deleteMany({});
// });

// afterAll(async () => {
//     await db.$disconnect();
// });

describe("test update password prisma query", () => {
    // afterEach(async () => {
    //     await db.user.deleteMany({});
    // });

    it("should update the user's password", async () => {
        const user = await createRandomUser();
        const password = faker.internet.password();
        const updatedUser = await updatePassword(user.email, password);
        expect(bcrypt.compareSync(password, updatedUser.password)).toBeTruthy();
    });

    it("should throw an error if updating the password fails", async () => {
        const password = faker.internet.password();
        try {
            const updatedUser = await updatePassword(faker.internet.email(), password);
        } catch (err: any) {
            expect(err.message).toEqual("Password updating failed");
            expect(err.status).toEqual(409);
        }
    });
});