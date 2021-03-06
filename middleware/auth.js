const jwt = require('jsonwebtoken');
const asyncHandler = require('./asyncHandler');
const ErrorResponse = require('../util/errorResponse');
const User = require('../models/User');

// Protect Routes
exports.protect = asyncHandler(async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    else if (req.cookies.token) {
        token = req.cookies.token
    }

    // Ensure token exists
    if (!token) {
        return next(new ErrorResponse('Not Authorized to access this resource', 401));
    }

    // Verify Token
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        console.log(decoded);

        req.user = await User.findById(decoded.id);

        next();
    } catch (error) {
        return next(new ErrorResponse('Not Authorized to access this resource', 401));
    } 
});

// Grant Access to specific roles
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new ErrorResponse(`User role ${req.user.role} is not authorzied to access this route`, 403));
        }

        next();
    }
}