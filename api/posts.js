const express = require('express');
const postsRouter = express.Router();
//sets up router for express

const { requireUser } = require('./utils');

//list checked by the bouncer to get into the club
const { getPostById, updatePost, getAllPosts, createPost } = require('../db');

postsRouter.use((req, res, next) => {
    console.log("A request is being made to /posts");

    next();
});

//breaks tags string into separate tags
postsRouter.post('/', requireUser, async (req, res, next) => {
    const { title, content, tags = "" } = req.body;
    // TagArr removes any spaces in the front or back, and then split will turn the string into an array, splitting over any number of spaces
    const tagArr = tags.trim().split(/\s+/)
    const postData = {};

    // only send the tags if there are some to send
    if (tagArr.length) {
        postData.tags = tagArr;
    }

    try {
        postData.authorId = req.user.id;
        postData.title = title;
        postData.content = content;

        const post = await createPost(postData);

        if (post) {
            res.send({ post })
        } else {
            next({
                name: 'PostCreationError',
                message: 'There was an error while trying to create this post. Please try again.'
            })
        }
        // this will create the post and the tags for us
        // if the post comes back, res.send({ post });
        // otherwise, next an appropriate error object 
    } catch ({ name, message }) {
        next({ name, message });
    }
});

//sets a route to read the param from the request
postsRouter.patch('/:postId', requireUser, async (req, res, next) => {
    const { postId } = req.params;
    const { title, content, tags } = req.body;

    const updateFields = {};

    if (tags && tags.length > 0) {
        updateFields.tags = tags.trim().split(/\s+/);
    }

    if (title) {
        updateFields.title = title;
    }

    if (content) {
        updateFields.content = content;
    }

    try {
        const originalPost = await getPostById(postId);
        //makes sure the post being updated belongs to the user doing the updating
        if (originalPost.author.id === req.user.id) {
            const updatedPost = await updatePost(postId, updateFields);
            res.send({ post: updatedPost })
        } else {
            next({
                name: 'UnauthorizedUserError',
                message: 'You cannot update a post that is not yours'
            })
        }
    } catch ({ name, message }) {
        next({ name, message });
    }
});

//sets route for reading all posts
postsRouter.get('/', async (req, res) => {
    const posts = await getAllPosts();

    res.send({
        posts
    });
});

postsRouter.get('/', async (req, res) => {
    try {
        const allPosts = await getAllPosts();
        //filters out active/inactive posts
        const posts = allPosts.filter(post => {
            return post.active || (req.user && post.author.id === req.user.id);
        });

        res.send({
            posts
        });
    } catch ({ name, message }) {
        next({ name, message });
    }
});

//updates a post to have active: false
postsRouter.delete('/:postId', requireUser, async (req, res, next) => {
    try {
        const post = await getPostById(req.params.postId);

        if (post && post.author.id === req.user.id) {
            const updatedPost = await updatePost(post.id, { active: false });

            res.send({ post: updatedPost });
        } else {
            // if there was a post, throw UnauthorizedUserError, otherwise throw PostNotFoundError
            next(post ? {
                name: "UnauthorizedUserError",
                message: "You cannot delete a post which is not yours!"
            } : {
                    name: "PostNotFoundError",
                    message: "That post does not exist..."
                });
        }

    } catch ({ name, message }) {
        next({ name, message })
    }
});

//bouncer at the club that checks the guest list
module.exports = postsRouter;