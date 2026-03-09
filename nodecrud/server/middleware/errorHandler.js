const { errorResponse } = require('../utils/response');

const errorHandler = (err, req, res, next) => {
    console.error(`[ERROR] ${err.message}`);

    // Mongoose duplicate key
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        return errorResponse(res, `${field} already exists`, 409);
    }
    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map((e) => e.message);
        return errorResponse(res, messages.join(', '), 400);
    }
    // Mongoose cast error (bad ObjectId)
    if (err.name === 'CastError') {
        return errorResponse(res, 'Invalid ID format', 400);
    }
    // JWT errors
    if (err.name === 'JsonWebTokenError') return errorResponse(res, 'Invalid token', 401);
    if (err.name === 'TokenExpiredError') return errorResponse(res, 'Token expired', 401);

    const statusCode = err.statusCode || 500;
    return errorResponse(res, err.message || 'Internal Server Error', statusCode);
};

module.exports = errorHandler;
