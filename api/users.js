const jwt = require('jsonwebtoken');
const express = require('express');
const usersRouter = express.Router();
//creates router for express to be reused

usersRouter.use((req, res, next) => {
    console.log("A request is being made to /users");

    next();
});

//names that can get into the club, checked by the bouncer
const { getAllUsers, getUserByUsername, createUser } = require('../db');

usersRouter.get('/', async (req, res) => {
    const users = await getAllUsers();

    res.send({
        users
    });
});


//route for verifying username and password
usersRouter.post('/login', async (req, res, next) => {
    const { username, password } = req.body;

    // request must have both
    if (!username || !password) {
        next({
            name: "MissingCredentialsError",
            message: "Please supply both a username and password"
        });
    }

    try {
        const user = await getUserByUsername(username);

        if (user && user.password == password) {
            const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET);
            console.log(token);


            // create token & return to user
            res.send({ message: "you're logged in!", token });
        } else {
            next({
                name: 'IncorrectCredentialsError',
                message: 'Username or password is incorrect'
            });
        }
    } catch (error) {
        console.log(error);
        next(error);
    }
});

//sets route for registering a user
usersRouter.post('/register', async (req, res, next) => {
    const { username, password, name, location } = req.body;

    try {
        const _user = await getUserByUsername(username);

        if (_user) { //checks to see if username is already taken
            next({
                name: 'UserExistsError',
                message: 'A user by that username already exists'
            });
        }

        const user = await createUser({ //tries to create user with inputs
            username,
            password,
            name,
            location,
        });

        const token = jwt.sign({ //assigns token
            id: user.id,
            username
        }, process.env.JWT_SECRET, {
            expiresIn: '1w'
        });

        res.send({
            message: "thank you for signing up",
            token
        });
    } catch ({ name, message }) {
        next({ name, message })
    }
});

//bouncer at the club that checks names on the list
module.exports = usersRouter;