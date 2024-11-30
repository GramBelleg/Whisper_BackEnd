import HttpError from "./HttpError";

class DuplicateUserError extends HttpError {
    public duplicate: { email?: string; userName?: string; password?: string };

    constructor(
        message: string,
        status: number,
        duplicate: { email?: string; userName?: string; password?: string }
    ) {
        super(message, status);
        this.duplicate = duplicate;
    }
}

export default DuplicateUserError;
