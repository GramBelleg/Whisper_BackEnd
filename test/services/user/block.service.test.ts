import { checkUsersExistDB, checkUserExistUsers } from '@src/services/user/block.service';
import HttpError from "@src/errors/HttpError";
import { findUsersByIds } from "@src/services/user/prisma/find.service";

jest.mock('@src/services/user/prisma/find.service');

describe('test check users exist in database', () => {
    it('should throw error if user does not exist', async () => {
        (findUsersByIds as jest.Mock).mockResolvedValue([]);
        await expect(checkUsersExistDB([1, 2])).rejects.toThrow(new HttpError("Some users do not exist", 404));
        expect(findUsersByIds).toHaveBeenCalled();
        expect(findUsersByIds).toHaveBeenCalledWith([1, 2]);
    });

    it('should throw error if some of users do not exist', async () => {
        (findUsersByIds as jest.Mock).mockResolvedValue([{ id: 1 }]);
        await expect(checkUsersExistDB([1, 2])).rejects.toThrow(new HttpError("Some users do not exist", 404));
        expect(findUsersByIds).toHaveBeenCalled();
        expect(findUsersByIds).toHaveBeenCalledWith([1, 2]);

    });

    it('should not throw error if all users exist', async () => {
        (findUsersByIds as jest.Mock).mockResolvedValue([{ id: 1 }, { id: 2 }]);
        await expect(checkUsersExistDB([1, 2])).resolves.not.toThrow();
        expect(findUsersByIds).toHaveBeenCalled();
        expect(findUsersByIds).toHaveBeenCalledWith([1, 2]);
    });
});


describe('test check user exist in users array', () => {
    it('should throw error if user is trying to block himself', () => {
        expect(() => checkUserExistUsers(1, [1, 2])).toThrow(new HttpError("User cannot block or unblock himself", 409));
    });

    it('should not throw error if user is not trying to block himself', () => {
        expect(() => checkUserExistUsers(1, [2, 3])).not.toThrow();
    });
});