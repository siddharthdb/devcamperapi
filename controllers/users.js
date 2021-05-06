const crypto = require('crypto');
const User = require('../models/User');
const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../util/errorResponse');

/**
 * @desc    Get all Users
 * @route   GET /api/v1/users
 * @access  Private/Admin
 */
exports.getUsers = asyncHandler(async (req, res, next) => {
    res.status(200).json(res.advanceResults);
});

/**
 * @desc    Get a single User
 * @route   GET /api/v1/users/:id
 * @access  Private/Admin
 */
exports.getUser = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    res.status(200).json({
        success: true,
        data: user
    });
});

/**
 * @desc    Create a User
 * @route   POST /api/v1/users/
 * @access  Private/Admin
 */
 exports.createUser = asyncHandler(async (req, res, next) => {
    const user = await User.create(req.body);

    res.status(201).json({
        success: true,
        data: user
    });
});

/**
* @desc    Update User
* @route   PUT /api/v1/users/:id
* @access  Private/Admin
*/
exports.updateUser = asyncHandler(async (req, res, next) => {
   const user = await User.findByIdAndUpdate(req.params.id, req.body, {
       new: true,
       runValidators: true
   });

   res.status(200).json({
       success: true,
       data: user
   });
});

/**
* @desc    Update User
* @route   DELETE /api/v1/users/:id
* @access  Private/Admin
*/
exports.deleteUser = asyncHandler(async (req, res, next) => {
    await User.findByIdAndDelete(req.params.id);
 
    res.status(200).json({
        success: true,
        data: {}
    });
 });

