const crypto = require('crypto');
const User = require('../models/User');
const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../util/errorResponse');
const sendEmail = require('../util/sendEmails');

/**
 * @desc    Register User
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
exports.register = asyncHandler(async (req, res, next) => {
    const {
        name,
        email,
        password,
        role
    } = req.body;

    // create user
    const user = await User.create({
        name,
        email,
        password,
        role
    });

    sendTokenResponse(user, 200, res);
});

/**
 * @desc    Login User
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
exports.login = asyncHandler(async (req, res, next) => {
    const {
        email,
        password
    } = req.body;

    // Validate Email and Password 

    if (!email || !password) {
        return next(new ErrorResponse('Please enter valid credentials.', 400));
    }

    // Check for User
    const user = await User.findOne({
        email
    }).select('+password');

    if (!user) {
        return next(new ErrorResponse('Invalid Credentials.', 401));
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
        return next(new ErrorResponse('Invalid Credentials.', 401));
    }

    sendTokenResponse(user, 200, res);
});

/**
 * @desc    Logout User / Clear Cookie
 * @route   GET /api/v1/auth/logout
 * @access  Private
 */
exports.logout = asyncHandler(async (req, res, next) => {
    res.cookie('token', 'none', {
        expires: new Date(0), // Set to epoch date
        httpOnly: true
    });

    res.status(200).json({
        success: true,
        data: {}
    });
    
});


/**
 * @desc    LoggedIn User
 * @route   POST /api/v1/auth/me
 * @access  Private
 */
exports.getCurrentUserLoggedIn = asyncHandler(async (req, res, next) => {

    const user = await User.findById(req.user.id);

    res.status(200).json({
        success: true,
        data: user
    })
});

/**
 * @desc    Update PAssword
 * @route   PUT /api/v1/auth/updatepassword
 * @access  Private
 */
 exports.updatePassword = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id).select('+password');

    // Check current Password

    if (!(await user.matchPassword(req.body.currentPassword))){
        return next(new ErrorResponse('Password is incorrect', 401));
    }

    user.password = req.body.newPassword;

    await user.save();

    sendTokenResponse(user, 200, res);
});

/**
 * @desc    Update User details
 * @route   PUT /api/v1/auth/updatedetails
 * @access  Private
 */
 exports.updateDetails = asyncHandler(async (req, res, next) => {
    const fieldsToUpdate = {
        name: req.body.name,
        email: req.body.email
    };

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        success: true,
        data: user
    })
});

/**
 * @desc    Forgot Password
 * @route   POST /api/v1/auth/forgotpassword
 * @access  Public
 */
exports.forgotPassword = asyncHandler(async (req, res, next) => {

    const user = await User.findOne({
        email: req.body.email
    });

    if (!user) {
        return next(new ErrorResponse('User not found for the email', 404));
    }

    // Get Reset token
    const resetToken = user.getResetPasswordToken();

    await user.save({
        validateBeforeSave: false
    });

    // Create ResetURL
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/auth/resetPassword/${resetToken}`;

    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. 
        Please make a PUT request to \n\n ${resetURL}`;

    try {
        await sendEmail({
            email: user.email,
            subject: 'PAssword reset token',
            message
        });

        res.status(200).json({
            success: true,
            data: 'Email Sent!'
        })
    } catch (error) {
        console.error(error);

        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save({
            validateBeforeSave: false
        });

        next(new ErrorResponse('Email could not be sent!', 500));
    }
});

/**
 * @desc    REset Password
 * @route   PUT /api/v1/auth/resetpassword/:resettoken
 * @access  Public
 */
exports.resetPassword = asyncHandler(async (req, res, next) => {
    // Get Hashed token 
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.resettoken).digest('hex');

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: {
            $gt: Date.now()
        }
    });

    if (!user) {
        next(new ErrorResponse('Invalid Token', 400));
    }

    // Set New Password
    user.password = req.body.password;

    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    user.save();

    sendTokenResponse(user, 200, res);
});

// Get Token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
    // Create Token
    const token = user.getSignedJWTToken();

    const options = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production'
    }

    res.status(statusCode)
        .cookie('token', token, options)
        .json({
            success: true,
            token
        })
}