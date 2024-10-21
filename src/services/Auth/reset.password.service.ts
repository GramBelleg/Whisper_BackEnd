import db from '@DB';
import bcrypt from 'bcrypt';


async function updatePassword(email: string, password: string) {
    await db.user.update({
        where: { email },
        data: {
            password: bcrypt.hashSync(password, 10),
            tokens: {
                deleteMany: {}
            }
        }
    });
}
export { updatePassword };