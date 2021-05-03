const express = require('express');
const dotenv = require('dotenv');

const app = express();
dotenv.config({ path: './config/config.env'});

app.get('/', (req, res) => {
    res.send('Hello Dev Camper');
})

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => { console.log(`Listening on Port - ${PORT}`) });