import redisSubscriber from "./redis.subscriber";
import { notifyExpiry } from "@socket/web.socket";

const expiredEvent = "__keyevent@0__:expired";

export const redisSubscribe = (): void => {
    redisSubscriber.subscribe(expiredEvent);
    redisSubscriber.on("message", (channel, key) => {
        if (channel === expiredEvent) {
            console.log(`Key expired: ${key}`);
            notifyExpiry(key);
        }
    });
};
