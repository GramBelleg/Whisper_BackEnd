import db from '@DB';


async function decrementUserDevices(userId: number) {
    await db.user.update({
        where: { id: userId },
        data: { loggedInDevices: { decrement: 1 } }
    });
}

async function resetUserDevices(userId: number) {
    await db.user.update({
        where: { id: userId },
        data: { loggedInDevices: 0 }
    });
}

export { decrementUserDevices, resetUserDevices };