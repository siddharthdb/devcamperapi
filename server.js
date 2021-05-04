const express = require('express');
const dotenv = require('dotenv');
const colors = require('colors');
const morgan  = require('morgan');

const errorHandler = require('./middleware/error');
const connectDB = require('./config/db');

// Load env vars
dotenv.config({ path: './config/config.env'});

// Connect to DB
connectDB();

//routes
const bootcamps = require('./routes/bootcamps');

const app = express();

// Body Parser
app.use(express.json());

// Dev Logging middleware logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Mount routers
app.use('/api/v1/bootcamps', bootcamps);

app.use(errorHandler);

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => { console.log(`Listening on Port - ${PORT}`.yellow.bold) });

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`.red.bold);
    // Close Server & exit process
    server.close(() => { process.exit(1) })    
})