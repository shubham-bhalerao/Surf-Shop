const express = require("express");
const router = express.Router();
const multer = require("multer");
const {
    cloudinary,
    storage
} = require('../cloudinary');
const upload = multer({
    storage
});
const {
    getPosts,
    newPost,
    createPost,
    showPost,
    editPost,
    updatePost,
    deletePost
} = require("../controllers/post");
const {
    isLoggedIn,
    isPostAuthor
} = require("../middleware");

//Index 
router.get("/", getPosts);

//New 
router.get("/new", isLoggedIn, newPost);

//Show
router.get("/:id", showPost);

//Create
router.post("/", isLoggedIn, upload.array("images", 4), createPost);

//Edit 
router.get("/:id/edit", isLoggedIn, isPostAuthor, editPost);

//Update
router.put("/:id/", isLoggedIn, isPostAuthor, upload.array("images", 4), updatePost);

//Delete
router.delete("/:id", isLoggedIn, isPostAuthor, deletePost);

module.exports = router;