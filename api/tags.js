const express = require('express');
const tagsRouter = express.Router();

tagsRouter.use((req, res, next) => {
    console.log("A request is being made to /tags");

    next();
});


const { getAllTags, getPostsByTagName } = require('../db');

//sets route for reading tags
tagsRouter.get('/', async (req, res) => {
    const tags = await getAllTags();

    res.send({
        tags
    });
});

tagsRouter.get('/:tagName/posts', async (req, res, next) => {
    try {
        const { tagName } = req.params;
        const taggedPosts = await getPostsByTagName(tagName);

        const posts = taggedPosts.filter(post => { //filters active/inactive posts by tag
            return post.active || (req.user && post.author.id === req.user.id);
        });

        res.send({ posts });
    } catch ({ name, message }) {
        next({
            name: 'TagNameError',
            message: `Error computing tag.`
        });
    }
})

module.exports = tagsRouter;