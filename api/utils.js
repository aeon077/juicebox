// sends and error when there is no user
// this function can be resused 

function requireUser(req, res, next) {
    if (!req.user) {
        next({
            name: "MissingUserError",
            message: "You must be logged in to perform this action"
        });
    }

    next();
}

module.exports = {
    requireUser
}