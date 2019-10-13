const Post = require("../models/post");
const Review = require("../models/review");

module.exports = {
    async createReview(req, res) {
        try {
            let post = await Post.findById(req.params.id).populate("reviews");
            let hasReviewed = post.reviews.filter(function (review) {
                return review.author.equals(req.user._id);
            }).length;
            if (hasReviewed) {
                req.flash("error", "You have already reviewed this post");
                return res.redirect("back");
            }
            let review = await Review.create(req.body.review);
            review.author = req.user._id;
            review.save();
            post.reviews.push(review);
            post.save();
            res.redirect(`/posts/${post._id}`);
        } catch (err) {
            console.log(err);
            req.flash("error", err.messgage);
            res.redirect("back");
        }
    },

    async updateReview(req, res) {
        try {
            await Review.findByIdAndUpdate(req.params.review_id, req.body.review);
            req.flash("success", "Updated Review");
            res.redirect(`/posts/${req.params.id}`);
        } catch (err) {
            console.log(err);
            req.flash("error", err.messgage);
            res.redirect("back");
        }
    },

    async deleteReview(req, res) {
        try {
            await Post.findByIdAndUpdate(req.params.id, {
                $pull: {
                    reviews: req.params.review_id
                }
            });
            await Review.findByIdAndDelete(req.params.review_id);
            req.flash("success", "Deleted Review");
            res.redirect(`/posts/${req.params.id}`);
        } catch (err) {
            console.log(err);
            req.flash("error", err.messgage);
            res.redirect("back");
        }
    }
}