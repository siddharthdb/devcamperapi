const express = require('express');
const {
    getReviews,
    getReview,
    addReviews,
    updateReviews,
    deleteReviews
} = require('../controllers/reviews');

const Review = require('../models/Review');

const advanceResults = require('../middleware/advanceResults');
const {
    protect,
    authorize
} = require('../middleware/auth');

const router = express.Router({
    mergeParams: true
});

router.route('/').get(advanceResults(Review, {
        path: 'bootcamp',
        select: 'name description'
    }), getReviews)
    .post(protect, authorize('user', 'admin'), addReviews)

router.route('/:id').get(getReview).put(protect, authorize('user', 'admin'), updateReviews)
    .delete(protect, authorize('user', 'admin'), deleteReviews);
module.exports = router;