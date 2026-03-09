const { verifyAccessToken } = require('../utils/jwt');
const User = require('../models/User');
const { errorResponse } = require('../utils/response');

const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        token = req.headers.authorization.split(' ')[1];
    }
    if (!token) return errorResponse(res, 'Not authorized, no token', 401);

    try {
        const decoded = verifyAccessToken(token);
        req.user = await User.findById(decoded.id).select('-password');
        if (!req.user) return errorResponse(res, 'User not found', 401);
        next();
    } catch (err) {
        return errorResponse(res, 'Token invalid or expired', 401);
    }
};

const requireAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') return next();
    return errorResponse(res, 'Admin access required', 403);
};

module.exports = { protect, requireAdmin };
