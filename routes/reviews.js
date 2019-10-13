const express = require("express"),
    router = express.Router({
        mergeParams: true
    });
const {
    createReview,
    updateReview,
    deleteReview
} = require("../controllers/review");
const {
    isLoggedIn,
    isReviewAuthor
} = require("../middleware");

//Create
router.post("/", isLoggedIn, createReview);

//Update
router.put("/:review_id", isLoggedIn, isReviewAuthor, updateReview);

//Delete
router.delete("/:review_id", isLoggedIn, isReviewAuthor, deleteReview);

module.exports = router;