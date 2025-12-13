export class ApiError extends Error {
    statusCode: number;
    code: string;
    details?: Record<string, any>;

    constructor(statusCode: number, code: string, message: string, details?: Record<string, any>) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.details = details;
    }
}

export const notFound = (message = 'Resource not found') => {
    return new ApiError(404, 'NOT_FOUND', message);
};

export const badRequest = (message: string, details?: Record<string, any>) => {
    return new ApiError(400, 'BAD_REQUEST', message, details);
};
