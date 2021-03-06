const Review = require('../models/Review');
const Bootcamp = require('../models/Bootcamp');
const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../util/errorResponse');

/**
 * @desc    Get Reviews
 * @route   GET /api/v1/reviews
 * @route   GET /api/v1/bootcamps/:bootcampId/reviews
 * @access  Public 
 */
 exports.getReviews = asyncHandler(async (req, res, next) => {
    if (req.params.bootcampId) {
        const reviews = await Review.find({
            bootcamp: req.params.bootcampId
        });
        return res.status(200).json({
            success: true,
            count: reviews.length,
            data: reviews
        })
    } else {
        res.status(200).json(res.advanceResults);
    }
});

/**
 * @desc    Get single Reviews
 * @route   GET /api/v1/reviews/:id
 * @access  Public 
 */
 exports.getReview = asyncHandler(async (req, res, next) => {
    const review = await Review.findById(req.params.id).populate({
        path: 'bootcamp',
        select: 'name description'
    });

    if (!review) {
        return next(new ErrorResponse(`No review found for ${req.params.id}`, 404))
    }

    res.status(200).json({
        success: true,
        data: review
    });

});

/**
 * @desc    Add Reviews
 * @route   POST /api/v1/bootcamp/:bootcampId/reviews
 * @access  Private 
 */
 exports.addReviews = asyncHandler(async (req, res, next) => {
    req.body.bootcamp = req.params.bootcampId;
    req.body.user = req.user.id;

    const bootcamp = await Bootcamp.findById(req.params.bootcampId);

    if (!bootcamp) {
        return next(new ErrorResponse(`No bootcamp found for id ${req.params.bootcampId}`, 404));
    }

    const review = await Review.create(req.body);

    res.status(201).json({
        success: true,
        data: review
    });
});

/**
 * @desc    Update Reviews
 * @route   PUT /api/v1/reviews/:id
 * @access  Private 
 */
 exports.updateReviews = asyncHandler(async (req, res, next) => {    
    let review = await Review.findById(req.params.id);

    if (!review) {
        return next(new ErrorResponse(`No review found for id ${req.params.id}`, 404));
    }

    // Ensure the user or user is admin
    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User ${req.user.id} not authorized to update the review ${review._id}`, 401));
    }

    review = await Review.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    res.status(201).json({
        success: true,
        data: review
    });
});

/**
 * @desc    Delete Reviews
 * @route   DELETE /api/v1/reviews/:id
 * @access  Private 
 */
 exports.deleteReviews = asyncHandler(async (req, res, next) => {    
    let review = await Review.findById(req.params.id);

    if (!review) {
        return next(new ErrorResponse(`No review found for id ${req.params.id}`, 404));
    }

    // Ensure the user or user is admin
    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User ${req.user.id} not authorized to delete the review ${review._id}`, 401));
    }

    review.remove()

    res.status(201).json({
        success: true,
        data: {}
    });
});