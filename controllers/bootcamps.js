/**
 * @desc    Get all bootcamps
 * @route   GET /api/v1/bootcamps
 * @access  Public 
 */
 exports.getBootcamps = (req, res, next) => {
    res.status(200).json({ success : true, msg: 'Show all Bootcamps', hello: req.hello});
}

/**
 * @desc    Get a single bootcamps
 * @route   GET /api/v1/bootcamps/:id
 * @access  Public 
 */
 exports.getBootcamp = (req, res, next) => {
    const id = req.params.id;
    res.status(200).json({ success : true, msg: `Show Bootcamp id - ${id}`});
}

/**
 * @desc    Create new bootcamp
 * @route   POST /api/v1/bootcamps
 * @access  Public 
 */
 exports.createBootcamp = (req, res, next) => {
    res.status(201).json({ success : true, msg: 'Create new Bootcamp'});
}

/**
 * @desc    Update bootcamp
 * @route   PUT /api/v1/bootcamps/:id
 * @access  Public 
 */
 exports.updateBootcamp = (req, res, next) => {
    const id = req.params.id;
    res.status(200).json({ success : true, msg: `Update Bootcamp id - ${id}`});
}

/**
 * @desc    Delete bootcamp
 * @route   DELETE /api/v1/bootcamps/:id
 * @access  Public 
 */
 exports.deleteBootcamp = (req, res, next) => {
    const id = req.params.id;
    res.status(200).json({ success : true, msg: `Delete Bootcamp id - ${id}`});
}