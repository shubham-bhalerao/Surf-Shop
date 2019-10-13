const Post = require("../models/post");
const Review = require("../models/review");
const {
    cloudinary
} = require('../cloudinary');
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const geocodingClient = mbxGeocoding({
    accessToken: process.env.MAPBOX
});

module.exports = {
    async getPosts(req, res) {
        try {
            const posts = await Post.paginate({}, {
                page: req.query.page || 1,
                limit: 10,
                sort: {
                    "_id": -1 //Sorting by _id in mongoose means by date created
                }
            });
            posts.page = Number(posts.page);
            res.render("posts/index", {
                posts,
                title: "Surf-Shop App",
                mapboxToken: process.env.MAPBOX
            });
        } catch (err) {
            console.log(err);
            res.redirect("back");
        }
    },

    newPost(req, res) {
        res.render("posts/new");
    },

    async createPost(req, res) {
        try {
            req.body.post.images = [];
            for (const file of req.files) {
                req.body.post.images.push({
                    url: file.secure_url,
                    public_id: file.public_id
                });
            }

            let response = await geocodingClient.forwardGeocode({
                query: req.body.post.location,
                limit: 1
            }).send();
            req.body.post.geometry = response.body.features[0].geometry;
            req.body.post.author = req.user._id;
            let post = new Post(req.body.post);
            post.properties.description = `<strong><a href="/posts/${post._id}">${post.title}</a></strong><p>${post.location}</p><p>${post.description.substring(0, 20)}...</p>`;
            post.save();
            res.redirect(`/posts/${post._id}`);
        } catch (err) {
            console.log(err);
            req.flash("error", err.message);
            res.redirect("back");
        }
    },

    async showPost(req, res) {
        try {
            const specificPost = await Post.findById(req.params.id)
                .populate({
                    path: "reviews",
                    options: {
                        sort: {
                            "_id": -1
                        }
                    },
                    populate: {
                        path: "author",
                        model: "User"
                    }
                }).populate("author");
            const floorRating = specificPost.calculateAvgRating();
            res.render("posts/show", {
                post: specificPost,
                floorRating,
                mapboxToken: process.env.MAPBOX
            });
        } catch (err) {
            console.log(err);
            req.flash("error", "Something went wrong");
            res.redirect("back");
        }
    },

    editPost(req, res) {
        try {
            const {
                post
            } = res.locals;
            res.render("posts/edit", {
                post
            })
        } catch (err) {
            console.log(err);
            res.redirect("back");
        }
    },

    async updatePost(req, res) {
        try {
            let {
                post
            } = res.locals;
            let deleteImages = req.body.deleteImages;
            if (deleteImages && deleteImages.length > 0) {
                for (const public_id of deleteImages) {
                    await cloudinary.v2.uploader.destroy(public_id);
                    for (const image of post.images) {
                        if (public_id === image.public_id) {
                            let index = post.images.indexOf(image);
                            post.images.splice(index, 1);
                        }
                    }
                }
            }
            if (req.files) {
                for (const file of req.files) {
                    post.images.push({
                        url: file.secure_url,
                        public_id: file.public_id
                    });
                }
            }
            if (req.body.post.location !== post.location) {
                let response = await geocodingClient.forwardGeocode({
                    query: req.body.post.location,
                    limit: 1
                }).send();
                post.geometry = response.body.features[0].geometry;
                post.location = req.body.post.location;
            }
            post.title = req.body.post.title;
            post.price = req.body.post.price;
            post.description = req.body.post.description;
            post.properties.description = `<strong><a href="/posts/${post._id}">${post.title}</a></strong><p>${post.location}</p><p>${post.description.substring(0, 20)}...</p>`;
            await post.save();
            req.flash("success", "Successfully updated post");
            res.redirect(`/posts/${post._id}`);
        } catch (err) {
            console.log(err);
            res.redirect("back");
        }
    },

    async deletePost(req, res) {
        try {
            let {
                post
            } = res.locals;
            for (const image of post.images) {
                await cloudinary.v2.uploader.destroy(image.public_id);
            }
            //Removing Reviews associated with the Post
            for (const reviewId of post.reviews) {
                await Review.findByIdAndDelete(reviewId);
            }
            await post.remove();
            req.flash("success", "Successfully deleted post");
            res.redirect("/posts");
        } catch (err) {
            console.log(err);
            res.redirect("back");
        }
    },
}