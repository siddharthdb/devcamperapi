const express = require('express');
const {
    createBootcamp,
    getBootcamp,
    deleteBootcamp,
    getBootcamps,
    updateBootcamp,
    getBootcampsZipcode,
    uploadPhotoBootcamp
} = require('../controllers/bootcamps');

const Bootcamp = require('../models/Bootcamp');

const advanceResults = require('../middleware/advanceResults');

const { protect, authorize } = require('../middleware/auth');

// Include other resource routers
const courseRouter = require('./courses');
const reviewRouter = require('./reviews');

const router = express.Router();

// Re-route into other resource routers
router.use('/:bootcampId/courses', courseRouter);
router.use('/:bootcampId/reviews', reviewRouter);

router.route('/radius/:zipcode/:distance').get(getBootcampsZipcode);

router.route('/').get(advanceResults(Bootcamp, 'courses'), getBootcamps).post(protect, authorize('publisher', 'admin'), createBootcamp);

router.route('/:id').get(getBootcamp).put(protect, authorize('publisher', 'admin'), updateBootcamp).delete(protect, authorize('publisher', 'admin'), deleteBootcamp);

router.route('/:id/photo').put(protect, authorize('publisher', 'admin'), uploadPhotoBootcamp);

module.exports = router;