const mongoose = require("mongoose");
const mongoosePaginate = require('mongoose-paginate');

const postSchema = new mongoose.Schema({
    title: String,
    price: String,
    description: String,
    images: [{
        url: String,
        public_id: String
    }],
    location: String,
    geometry: {
        type: {
            type: String,
            enum: ["Point"],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    properties: {
        description: String
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    reviews: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review"
    }],
    avgRating: {
        type: Number,
        default: 0
    }
});
postSchema.plugin(mongoosePaginate);

postSchema.methods.calculateAvgRating = function () {
    let totalRating = 0;
    if (this.reviews.length) {
        this.reviews.forEach(function (review) {
            totalRating += review.rating;
        });
        this.avgRating = Math.round((totalRating / this.reviews.length) * 10) / 10;
    } else {
        this.avgRating = 0;
    }
    this.save();
    const floorRating = Math.floor(this.avgRating);
    return floorRating;
}

module.exports = mongoose.model("Post", postSchema);