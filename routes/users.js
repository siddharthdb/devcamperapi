const express = require('express');

const {
    getUser,
    getUsers,
    createUser,
    updateUser,
    deleteUser
} = require('../controllers/users');


const User = require('../models/User');

const advanceResults = require('../middleware/advanceResults');
const {
    protect,
    authorize
} = require('../middleware/auth');

const router = express.Router({
    mergeParams: true
});

router.use(protect);
router.use(authorize('admin'));

router.route('/')
    .get(advanceResults(User), getUsers)
    .post(createUser)

router.route('/:id')
    .get(getUser)
    .put(updateUser)
    .delete(deleteUser);

module.exports = router;