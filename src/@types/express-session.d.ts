// express-session.d.ts
import "express-session";

declare module "express-session" {
    interface Session {
        state?: string; // Add your custom properties here
    }
}
