const path = require('path');
const Bootcamp = require('../models/Bootcamp');
const geocoder = require('../util/geocoder');
const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../util/errorResponse');

/**
 * @desc    Get all bootcamps
 * @route   GET /api/v1/bootcamps
 * @access  Public 
 */
exports.getBootcamps = asyncHandler(async (req, res, next) => {
    res.status(200).json(res.advanceResults);
});

/**
 * @desc    Get bootcamps within radius 
 * @route   GET /api/v1/bootcamps/radius/:zipcode/:distance
 * @access  Public 
 */
exports.getBootcampsZipcode = asyncHandler(async (req, res, next) => {
    const {
        zipcode,
        distance
    } = req.params;

    //Get Lat/Long from geocoder
    const loc = await geocoder.geocode(zipcode);
    const lat = loc[0].latitude;
    const long = loc[0].longitude;

    // calc radius
    // Divide distance by radius of earth
    // Earth RADIUS = 3963mi (6378km)
    const radius = distance / 3963;

    const bootcamps = await Bootcamp.find({
        location: {
            $geoWithin: {
                $centerSphere: [
                    [long, lat], radius
                ]
            }
        }
    })

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
    // Add User to req.body 
    req.body.user = req.user.id;

    // Check for published bootcamp
    const publishedBootcamp = await Bootcamp.findOne({
        user: req.user.id
    });

    // restrict user to add only one bootcamp. Admin can add many
    if (publishedBootcamp && req.user.role !== 'admin') {
        return next(new ErrorResponse(`The user with id ${req.user.id} has already published a bootcamp`, 400));
    }

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
    let bootcamp = await Bootcamp.findById(id);

    if (!bootcamp) {
        return next(new ErrorResponse(`No records found for Id: ${id}`, 404));
    }

    // Ensure the user is bootcamp owner
    if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User ${req.user.id} not authorized to update this bootcamp`, 401));
    }

    bootcamp = await Bootcamp.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true
    });

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
    const bootcamp = await Bootcamp.findById(id);

    if (!bootcamp) {
        return next(new ErrorResponse(`No records found for Id: ${id}`, 404));
    }

    // Ensure the user is bootcamp owner
    if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User ${req.user.id} not authorized to delete this bootcamp`, 401));
    }

    bootcamp.remove();

    res.status(200).json({
        success: true,
        data: {}
    });
});

/**
 * @desc    Upload photo for bootcamp
 * @route   PUT /api/v1/bootcamps/:id/photo
 * @access  Private
 */
exports.uploadPhotoBootcamp = asyncHandler(async (req, res, next) => {
    const id = req.params.id;
    const bootcamp = await Bootcamp.findById(id);

    if (!bootcamp) {
        return next(new ErrorResponse(`No records found for Id: ${id}`, 404));
    }

    // Ensure the user is bootcamp owner
    if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User ${req.user.id} not authorized to upload photo to this bootcamp`, 401));
    }

    if (!req.files) {
        return next(new ErrorResponse(`Please upload a file`, 400));
    }

    const file = req.files.file;

    // Image is a Photo validation
    if (!file.mimetype.startsWith('image')) {
        return next(new ErrorResponse(`Please upload an image file (supported types - jpeg, png, gif, bmp,...)`, 400));
    }

    // Check file size
    if (!file.size > process.env.MAX_FILE_UPLOAD) {
        return next(new ErrorResponse(`Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`, 400));
    }

    // Create custom filename
    file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;

    file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
        if (err) {
            console.error(err);
            return next(new ErrorResponse(`Erro in uploading file`, 500));
        }

        await Bootcamp.findByIdAndUpdate(id, {
            photo: file.name
        });

        res.status(200).json({
            success: true,
            data: file.name
        });
    });
});