require('dotenv').config();
const express = require("express");
const engine = require('ejs-mate');
const flash = require('connect-flash');
const app = express();
const passport = require("passport");
const User = require("./models/user");
const session = require("express-session");
// const bodyParser = require("body-parser");
// Body Parser now included in express
const methodOverride = require("method-override");
const mongoose = require("mongoose");

// const seedDb = require("./seeds");
// seedDb();
const postRoutes = require("./routes/posts");
const reviewRoutes = require("./routes/reviews");
const indexRoutes = require("./routes/index");

mongoose.connect("mongodb://localhost:27017/surf-shop", {
    useNewUrlParser: true,
    useCreateIndex: true
});

//Express Config
app.engine('ejs', engine);
app.set("view engine", "ejs");
app.use(express.urlencoded({
    extended: true
}));
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));

//Setting Up Sessions
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
}));
app.use(flash());

//Passport Config
app.use(passport.initialize());
app.use(passport.session());

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//Routes
app.use((req, res, next) => {
    //Logged In User
    // req.user = {
    //     "_id": "5ca7a4102708bd2fb093375b",
    //     // "_id": "5cb175ac84c890306025e9c7",
    //     "username": "sb"
    // }
    res.locals.currentUser = req.user;
    res.locals.title = "Surf Shop";
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
});

app.use("/posts", postRoutes);
app.use("/posts/:id/reviews", reviewRoutes);
app.use(indexRoutes);

app.listen(3000, () => console.log("Surf Shop Started..."));