import * as admin from 'firebase-admin';

class FirebaseAdmin {
    private static instance: admin.app.App | null = null;

    private constructor() {
        // Private constructor to prevent direct instantiation
    }

    public static getInstance(): admin.app.App {
        if (!FirebaseAdmin.instance) {
            FirebaseAdmin.instance = admin.initializeApp({
                credential: admin.credential.cert({
                    projectId: process.env.FIREBASE_PROJECT_ID,
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                    privateKey: (process.env.FIREBASE_PRIVATE_KEY as string).replace(/\\n/g, '\n')
                }),
            });
        }
        return FirebaseAdmin.instance;
    }

    public static async shutdown(): Promise<void> {
        if (FirebaseAdmin.instance) {
            await FirebaseAdmin.instance.delete();
            FirebaseAdmin.instance = null;
            console.log('Firebase Admin app has been deleted.');
        }
    }
}

export default FirebaseAdmin;
