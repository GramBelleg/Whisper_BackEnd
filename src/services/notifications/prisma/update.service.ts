import db from '@DB';
import HttpError from '@src/errors/HttpError';

export const updateFCMToken = async (userId: number, token: string, fcmToken: string) => {
    try {
        await db.userToken.update({
            where: {
                userId_token: {
                    userId,
                    token,
                },
            },
            data: {
                deviceToken: fcmToken,
            },
        });
    } catch (error) {
        throw new HttpError('FCM token updating failed', 409);
    }
}