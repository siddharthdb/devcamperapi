const express = require('express');
const dotenv = require('dotenv');
const colors = require('colors');
const morgan  = require('morgan');
const fileUpload = require('express-fileupload');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const xss = require('xss-clean');
const hpp = require('hpp');
const rateLimit = require('express-rate-limit');
const cors = require('cors');

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

// Sanitize data
app.use(mongoSanitize());

// Helmet XSS
app.use(helmet());

// XSS Clean
app.use(xss());

// Express Rate Limiter
const appLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 mins
    max: 100
})

app.use(appLimiter);

// prevent http param pollution
app.use(hpp());

// Enable CORS
app.use(cors());

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