import { checkEmailExistDB, checkPasswordCorrect } from "@src/services/auth/login.service";
import { faker } from "@faker-js/faker";
import { createRandomUser } from "@src/services/prisma/create.service";


describe("test check email exist in DB service", () => {
    it("should succeed in test", async () => {
        const user = await createRandomUser();
        const result = await checkEmailExistDB(user.email);
        expect(result.email).toBe(user.email);
    })
    it("should fail in test", async () => {
        try {
            await checkEmailExistDB(faker.internet.email());
        } catch (error: any) {
            expect(error.message).toBe("Email is not existed in DB");
        }
    })
});

describe("test check password correct service", () => {
    it("should succeed in test", async () => {
        const newUser = await createRandomUser();
        const checked = checkPasswordCorrect("123456789", newUser?.password);
        expect(checked).toBeUndefined();
    });
    it("should fail in test", () => {
        try {
            checkPasswordCorrect("123456789", "$2b$10$6RQxLq3Z5Xz9z9j6J7V8oO7bH3V4z0z8");
        } catch (error: any) {
            expect(error.message).toBe("Incorrect password. Try again");
        }
    });
});