const Bootcamp = require('../models/Bootcamp');
const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../util/errorResponse');

/**
 * @desc    Get all bootcamps
 * @route   GET /api/v1/bootcamps
 * @access  Public 
 */
exports.getBootcamps = asyncHandler(async (req, res, next) => {
    const bootcamps = await Bootcamp.find();
    res.status(200).json({
        success: true,
        count: bootcamps.length,
        data: bootcamps
    });
});

/**
 * @desc    Get a single bootcamps
 * @route   GET /api/v1/bootcamps/:id
 * @access  Public 
 */
exports.getBootcamp = asyncHandler(async (req, res, next) => {
    const id = req.params.id;
    const bootcamp = await Bootcamp.findById(id);

    if (!bootcamp) {
        return next(new ErrorResponse(`No records found for Id: ${id}`, 404));
    }

    res.status(200).json({
        success: true,
        data: bootcamp
    });
});

/**
 * @desc    Create new bootcamp
 * @route   POST /api/v1/bootcamps
 * @access  Public 
 */
exports.createBootcamp = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.create(req.body);
    res.status(201).json({
        success: true,
        data: bootcamp
    });
});

/**
 * @desc    Update bootcamp
 * @route   PUT /api/v1/bootcamps/:id
 * @access  Public 
 */
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
    const id = req.params.id;
    const bootcamp = await Bootcamp.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true
    });

    if (!bootcamp) {
        return next(new ErrorResponse(`No records found for Id: ${id}`, 404));
    }

    res.status(200).json({
        success: true,
        data: bootcamp
    });
});

/**
 * @desc    Delete bootcamp
 * @route   DELETE /api/v1/bootcamps/:id
 * @access  Public 
 */
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
    const id = req.params.id;
    const bootcamp = await Bootcamp.findByIdAndDelete(id);

    if (!bootcamp) {
        return next(new ErrorResponse(`No records found for Id: ${id}`, 404));
    }

    res.status(200).json({
        success: true,
        data: {}
    });
});