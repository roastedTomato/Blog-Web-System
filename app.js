// Load a .env file if one exists
require('dotenv').config()

const express = require("express");
const handlebars = require("express-handlebars");
const app = express();

// Listen port will be loaded from .env file, or use 3000
const port = process.env.EXPRESS_PORT || 3000;

// Setup Handlebars
app.engine("handlebars", handlebars.create({
    defaultLayout:"main",
    helpers: {
        formatDate: function(date) {
            if (!date) return '';
            const d = new Date(date);
            const year = d.getFullYear();
            const month = d.toLocaleString('en-US', { month: 'short' });
            const day = d.getDate();
            return `${day} ${month} ${year}`;
        },
        eq: function(a, b) {
            return a === b;
        },
        json: function(context) {
            return JSON.stringify(context);
        }
    }
}).engine);
app.set("view engine", "handlebars");

// Set up to read POSTed form data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// TODO: Your app here

// Fix BigInt serialization issue
BigInt.prototype.toJSON = function() {
    return Number(this);
};

//setup cookie-parser
const cookieParser = require("cookie-parser")
app.use(cookieParser());

//setup express-session
const session = require("express-session");
app.use(session({
    resave: false,
    saveUninitialized: false,
    secret: "COMPX569"
}));

// Make the "user" session object available to all views
app.use(function (req, res, next) {
    res.locals.user = req.session.user;
    next();
});

// Make the "public" folder available statically
const path = require("path");
app.use("/public", express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "public", "uploads")));


//setup our routes
const index = require("./routes/index-routes.js");
app.use('/', index);

const user = require("./routes/user-routes.js");
app.use('/user', user);

const article = require("./routes/article-routes.js");
app.use('/article', article);

const comment = require("./routes/comment-routes.js");
app.use('/comment', comment);


app.listen(port, function () {
    console.log(`Web final project listening on http://localhost:${port}/`);
});
