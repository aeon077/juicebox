const jwt = require('jsonwebtoken');
const { getUserById } = require('../db');
const { JWT_SECRET } = process.env;

const express = require('express');
const apiRouter = express.Router();


//three possibilities when requesting API
apiRouter.use(async (req, res, next) => {
    const prefix = 'Bearer ';
    const auth = req.header('Authorization');

    if (!auth) { // nothing to see here
        next();
    } else if (auth.startsWith(prefix)) { //if auth set starts with Bearer, it adds token
        const token = auth.slice(prefix.length);

        try {
            const { id } = jwt.verify(token, JWT_SECRET);
            //reads and decrypts token, verifies, and reads user data from database
            if (id) {
                req.user = await getUserById(id);
                next();
            }
        } catch ({ name, message }) {
            next({ name, message });
        }
    } else { //or it will throw and error with a name and message
        next({
            name: 'AuthorizationHeaderError',
            message: `Authorization token must start with ${prefix}`
        });
    }
});

apiRouter.use((req, res, next) => {
    if (req.user) {
        console.log("User is set:", req.user);
    }

    next();
});

//sets routes for users, posts and tags, plus error
const usersRouter = require('./users');
apiRouter.use('/users', usersRouter);

const postsRouter = require('./posts');
apiRouter.use('/posts', postsRouter)

const tagsRouter = require('./tags');
apiRouter.use('/tags', tagsRouter)

//error handler
apiRouter.use((error, req, res, next) => {
    res.send(error);
});




module.exports = apiRouter, usersRouter, postsRouter, tagsRouter;
