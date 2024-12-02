//m3le4 used this instead of res.status 34an a3raf athrow error from anywhere hata lw m4 m3aya response obj
class HttpError extends Error {
    public status?: number;

    constructor(message: string, status?: number) {
        super(message);
        this.status = status;
    }
}
export default HttpError;
