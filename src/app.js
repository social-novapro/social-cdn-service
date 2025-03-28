const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const cors = require('cors');
const config = require('../config.json');
const PORT = config.PORT;
const app = express();
const APIv1 = require('./routes/v1/');
const multer = require('multer');

require('dotenv').config()

app.use(cors());

// Set up multer to handle large file uploads
app.use(express.json());
app.use(express.urlencoded({extended: false}));
// app.use(express.json({ limit: '1000mb' }))
// app.use(express.urlencoded({ limit: '1000mb', extended: true }))
// app.use((req, res, next) => {
//     console.log('----');
//     console.log(req.originalUrl)
//     next();
// });

mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

app.use((req, res, next) => {
    console.log('----');
    console.log(req.originalUrl)
    next();
});

app.use('/v1', APIv1);

app.get('/', (req, res) => res.sendFile('./home/index.html', { root: __dirname }));
app.get('/script.js', (req, res) => res.sendFile('./home/script.js', { root: __dirname }));

const server = http.createServer(app);
server.listen(PORT, () => console.log(`Server started on port ${PORT}!`));
