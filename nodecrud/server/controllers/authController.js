const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const { successResponse, errorResponse } = require('../utils/response');
const { body } = require('express-validator');
const validate = require('../middleware/validate');

// @desc  Register
// @route POST /api/auth/register
const register = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;
        const exists = await User.findOne({ email });
        if (exists) return errorResponse(res, 'Email already registered', 409);

        const user = await User.create({ name, email, password });
        const accessToken = generateAccessToken(user._id);
        const refreshTokenStr = generateRefreshToken(user._id);

        await RefreshToken.create({
            token: refreshTokenStr,
            user: user._id,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });

        return successResponse(res, { user, accessToken, refreshToken: refreshTokenStr }, 'Registered successfully', 201);
    } catch (err) {
        next(err);
    }
};

// @desc  Login
// @route POST /api/auth/login
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user || !(await user.matchPassword(password))) {
            return errorResponse(res, 'Invalid credentials', 401);
        }

        const accessToken = generateAccessToken(user._id);
        const refreshTokenStr = generateRefreshToken(user._id);

        await RefreshToken.create({
            token: refreshTokenStr,
            user: user._id,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });

        return successResponse(res, { user, accessToken, refreshToken: refreshTokenStr }, 'Login successful');
    } catch (err) {
        next(err);
    }
};

// @desc  Refresh token
// @route POST /api/auth/refresh-token
const refreshToken = async (req, res, next) => {
    try {
        const { refreshToken: token } = req.body;
        if (!token) return errorResponse(res, 'Refresh token required', 400);

        const stored = await RefreshToken.findOne({ token });
        if (!stored) return errorResponse(res, 'Invalid refresh token', 401);

        const decoded = verifyRefreshToken(token);
        const newAccessToken = generateAccessToken(decoded.id);
        return successResponse(res, { accessToken: newAccessToken }, 'Token refreshed');
    } catch (err) {
        next(err);
    }
};

// @desc  Logout
// @route POST /api/auth/logout
const logout = async (req, res, next) => {
    try {
        const { refreshToken: token } = req.body;
        await RefreshToken.deleteOne({ token });
        return successResponse(res, null, 'Logged out successfully');
    } catch (err) {
        next(err);
    }
};

// @desc  Get current user
// @route GET /api/auth/me
const getMe = async (req, res, next) => {
    try {
        return successResponse(res, req.user, 'User fetched');
    } catch (err) {
        next(err);
    }
};

module.exports = { register, login, refreshToken, logout, getMe };
