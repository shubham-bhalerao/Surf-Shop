const User = require("../models/user");
const Post = require("../models/post");
const passport = require("passport");

module.exports = {

    async landingPage(req, res, next) {
        const posts = await Post.find({});
        res.render("landing", {
            posts,
            mapboxToken: process.env.MAPBOX,
            title: "Surf Shop home"
        });
    },

    getRegister(req, res, next) {
        res.render('register', {
            title: 'Register',
            username: "",
            email: ""
        });
    },

    async postRegister(req, res, next) {
        try {
            var newUser = new User({
                username: req.body.username,
                email: req.body.email,
                image: req.body.image
            });
            let user = await User.register(newUser, req.body.password);
            req.login(user, function (err) {
                if (err) return next(err);
                req.flash("success", `Welcome To Surf Shop ${user.username}`);
                res.redirect("/");
            })
        } catch (err) {
            let error = err.message;
            if (error.includes('duplicate') && error.includes('index: email_1 dup key')) {
                error = 'A user with the given email is already registered';
            }
            res.render('register', {
                title: 'Register',
                username: newUser.username,
                email: newUser.email,
                error
            });
        }


    },

    getLogin(req, res, next) {
        if (req.isAuthenticated()) return res.redirect("back");
        if (req.query.returnTo) req.session.redirectTo = req.headers.referer;
        res.render('login', {
            title: 'Login'
        });
    },
    async postLogin(req, res, next) {
        const {
            username,
            password
        } = req.body;
        const {
            user,
            error
        } = await User.authenticate()(username, password);
        if (error && !user) {
            req.flash("error", error.message);
            return res.redirect("back");
        }
        req.login(user, function (err) {
            if (err) return next(err);
            req.flash("success", `Welcome back, ${user.username}`);
            const redirectUrl = req.session.redirectTo || "/";
            delete req.session.redirectTo;
            res.redirect(redirectUrl);
        });
    },

    getLogout(req, res, next) {
        req.logout();
        res.redirect("/");
    },

    async getProfile(req, res, next) {
        let posts = await Post.find().where("author").equals(req.user._id).limit(10).exec();
        let user = req.user;
        res.render("profile", {
            posts,
            user
        });
    },

    async updateProfile(req, res, next) {
        const {
            username,
            email
        } = req.body;
        const {
            user
        } = res.locals;
        //Unique username
        if (username !== req.user.username) {
            let userExists = await User.findOne({
                username: username
            });
            if (userExists) {
                req.flash("error", "A user with given username already exists");
                return res.redirect("/profile");
            } else
                user.username = username;
        }
        user.username = username;
        user.email = email;
        await user.save();
        req.login(user, function (err) {
            if (err)
                res.redirect("back");
            else {
                req.flash("success", "Successfully Updated Profile");
                res.redirect("/profile");
            }
        })
    }
}