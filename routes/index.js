const express = require('express');
const router = express.Router();
const {
    getRegister,
    postRegister,
    getLogin,
    postLogin,
    getLogout,
    landingPage,
    getProfile,
    updateProfile
} = require("../controllers/index");
const {
    isLoggedIn,
    isValidPassword,
    changePassword
} = require('../middleware')

/* GET home page. */
router.get('/', landingPage);

/* GET /register */
router.get('/register', getRegister);

/* POST /register */
router.post('/register', postRegister);

/* GET /login */
router.get('/login', getLogin);

/* POST /login */
router.post('/login', postLogin);

/* GET /logout */
router.get('/logout', isLoggedIn, getLogout);

/* GET /profile */
router.get('/profile', isLoggedIn, getProfile);

/* PUT /profile/:user_id */
router.put("/profile", isValidPassword, changePassword, updateProfile);

/* GET /forgot */
router.get('/forgot', (req, res) => {
    res.send('GET /forgot');
});

/* PUT /forgot */
router.put('/forgot', (req, res) => {
    res.send('PUT /forgot');
});

/* GET /reset */
router.get('/reset/:token', (req, res) => {
    res.send('GET /reset/:token');
});

/* PUT /reset */
router.put('/reset/:token', (req, res) => {
    res.send('PUT /reset/:token');
});

module.exports = router;