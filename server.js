const express = require('express');
const dotenv = require('dotenv');
const colors = require('colors');
const morgan  = require('morgan');
const fileUpload = require('express-fileupload');
const cookieParser = require('cookie-parser');

const errorHandler = require('./middleware/error');
const connectDB = require('./config/db');
const path = require('path');

// Load env vars
dotenv.config({ path: './config/config.env'});

// Connect to DB
connectDB();

//routes
const bootcamps = require('./routes/bootcamps');
const courses = require('./routes/courses');
const reviews = require('./routes/reviews');
const auth = require('./routes/auth');
const users = require('./routes/users');

const app = express();

// Body Parser
app.use(express.json());

// Cookie Parser
app.use(cookieParser());

// Dev Logging middleware logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Express file uploader middleware
app.use(fileUpload());

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// Mount routers
app.use('/api/v1/bootcamps', bootcamps);
app.use('/api/v1/courses', courses);
app.use('/api/v1/reviews', reviews);
app.use('/api/v1/auth', auth);
app.use('/api/v1/users', users);

app.use(errorHandler);

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => { console.log(`Listening on Port - ${PORT}`.yellow.bold) });

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`.red.bold);
    
    // Close Server & exit process
    server.close(() => { process.exit(1) })    
})