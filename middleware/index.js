const Review = require("../models/review");
const User = require("../models/user");
const Post = require("../models/post");

module.exports = {
    async isReviewAuthor(req, res, next) {
        let review = await Review.findById(req.params.review_id);
        if (review.author.equals(req.user._id)) {
            res.locals.review = review;
            next();
        } else {
            req.flash("error", "You Dont Have permission to do that");
            res.redirect("back");
        }
    },

    isLoggedIn(req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        }
        req.flash("error", "You need to login First!");
        req.session.redirectTo = req.originalUrl;
        res.redirect("/login");
    },

    async isPostAuthor(req, res, next) {
        let post = await Post.findById(req.params.id);
        if (post.author.equals(req.user._id)) {
            res.locals.post = post;
            return next();
        }
        req.flash("error", "Access Denied");
        res.redirect("back");
    },

    async isValidPassword(req, res, next) {
        const {
            user
        } = await User.authenticate()(req.user.username, req.body.currentPassword);
        if (user) {
            res.locals.user = user;
            next();
        } else {
            req.flash("error", "Incorrect Password");
            return res.redirect("/profile");
        }
    },

    async changePassword(req, res, next) {
        const {
            newPassword,
            passwordConfirmation
        } = req.body;
        if (newPassword && !passwordConfirmation) {
            req.flash("error", "Password Confirmation is missing");
            return res.redirect("/profile");
        }
        if (newPassword && passwordConfirmation) {
            const user = res.locals.user;
            if (newPassword === passwordConfirmation) {
                await user.setPassword(newPassword);
                next();
            } else {
                req.flash("error", "Passwords dont match!");
                return res.redirect("back");
            }
        } else {
            next();
        }
    }

}