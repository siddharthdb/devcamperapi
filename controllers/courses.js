const Course = require('../models/Course');
const Bootcamp = require('../models/Bootcamp');
const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../util/errorResponse');

/**
 * @desc    Get courses
 * @route   GET /api/v1/courses
 * @route   GET /api/v1/bootcamps/:bootcampId/courses
 * @access  Public 
 */
exports.getCourses = asyncHandler(async (req, res, next) => {
    if (req.params.bootcampId) {
        const courses = await Course.find({
            bootcamp: req.params.bootcampId
        });
        return res.status(200).json({
            success: true,
            count: courses.length,
            data: courses
        })
    } else {
        res.status(200).json(res.advanceResults);
    }
});

/**
 * @desc    Get a single course
 * @route   GET /api/v1/courses/:id
 * @access  Public 
 */
exports.getCourse = asyncHandler(async (req, res, next) => {
    const course = await Course.findById(req.params.id).populate('bootcamp');

    if (!course) {
        return next(new ErrorResponse(`No Course with id of ${req.params.id}`, 404));
    }

    res.status(200).json({
        success: true,
        data: course
    })
});

/**
 * @desc    Add a course
 * @route   POST /api/v1/bootcamp/:bootcampId/courses
 * @access  Private 
 */
exports.addCourse = asyncHandler(async (req, res, next) => {
    req.body.bootcamp = req.params.bootcampId;
    req.body.user = req.user.id;

    const bootcamp = await Bootcamp.findById(req.params.bootcampId);

    if (!bootcamp) {
        return next(new ErrorResponse(`No Bootcamp with id of ${req.params.bootcampId}`, 404));
    }

    // Ensure the user is course owner
    if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User ${req.user.id} not authorized to add a course to bootcamp ${bootcamp._id}`, 401));
    }

    const course = await Course.create(req.body);

    res.status(201).json({
        success: true,
        data: course
    })
});

/**
 * @desc    Update a course
 * @route   PUT /api/v1/courses/:id
 * @access  Private 
 */
exports.updateCourse = asyncHandler(async (req, res, next) => {
    let course = await Course.findById(req.params.id);

    if (!course) {
        return next(new ErrorResponse(`No Course with id of ${req.params.id}`, 404));
    }

    // Ensure the user is course owner
    if (course.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User ${req.user.id} not authorized to update course ${course._id}`, 401));
    }

    course = await Course.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        success: true,
        data: course
    })
});

/**
 * @desc    Delete a course
 * @route   DELETE /api/v1/courses/:id
 * @access  Private 
 */
exports.deleteCourse = asyncHandler(async (req, res, next) => {
    const course = await Course.findById(req.params.id);

    if (!course) {
        return next(new ErrorResponse(`No Course with id of ${req.params.id}`, 404));
    }

    // Ensure the user is course owner
    if (course.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User ${req.user.id} not authorized to delete course ${course._id}`, 401));
    }

    await course.remove();

    res.status(200).json({
        success: true,
        data: {}
    })
});