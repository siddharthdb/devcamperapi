const express = require('express');
const dotenv = require('dotenv');

// const logger = require('./middleware/logger');
const morgan  = require('morgan');

//routes
const bootcamps = require('./routes/bootcamps');

const app = express();

// Load env vars
dotenv.config({ path: './config/config.env'});

// Dev Logging middleware logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Mount routers
app.use('/api/v1/bootcamps', bootcamps);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => { console.log(`Listening on Port - ${PORT}`) });