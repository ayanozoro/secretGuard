export default function errorHandler(error, req, res, next) {
    const statusCode = error.statusCode || 500;
    const message = error.message || "Internal server error";

    return res.status(statusCode).json({
        status: 'error',
        statusCode,
        message,
    })
}