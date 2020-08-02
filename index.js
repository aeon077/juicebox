//boilerplate for the web server

require('dotenv').config(); //stores our secrets
const { PORT = 3000 } = process.env;
const express = require('express');
const server = express();

// console.log(process.env.XXX-XXXXXXX); //reveals our secrets

//more middleware
// body-parser will read incoming JSON from requests.
// morgan is a function which logs out the incoming requests with the method
// route, http response, and response time.
const bodyParser = require('body-parser');
server.use(bodyParser.json());

const morgan = require('morgan');
server.use(morgan('dev'));

server.use((req, res, next) => { //middleware that tells server to always run this function (three lines of code)
    console.log("<____Body Logger START____>");
    console.log(req.body);
    console.log("<_____Body Logger END_____>");

    next();
});

const apiRouter = require('./api');
server.use('/api', apiRouter);

//connects client to the server
const { client } = require('./db');
client.connect();


server.listen(PORT, () => {
    console.log('The server is up on port', PORT)
})
