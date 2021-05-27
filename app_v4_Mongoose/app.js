const path = require("path");
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require("mongoose");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const csrf = require("csurf");
const flash = require("connect-flash");

const errorControllers = require("./controllers/errors");
const User = require("./models/user");
const rootDir = require('./utils/path');
const config = require("./config.json");
const uri = config.db_uri;

const app = express();
const store = new MongoDBStore({
    uri,
    collection: "sessions"
});

const csrfProtection = csrf();

app.set('view engine', 'ejs');

const adminRoutes = require("./routes/admin.js");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");

// Parse the request body
app.use(bodyParser.urlencoded({extended: false}));

// Serve static files / register static folder path
app.use(express.static(path.join(rootDir, 'public')));

// use the session middleware
app.use(
    session({
        secret: "my secret", 
        resave: false, 
        saveUninitialized: false,
        store: store
    })
);

// CSRF Protection Middleware
app.use(csrfProtection);

// used to store messages for redirects
app.use(flash());

// add response local variables that are required by the views
app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isLoggedIn;
    res.locals.csrfToken = req.csrfToken();
    next();
});

// log every request
app.use((req, res, next) => {
    console.log(new Date(), req.method, req.url);
    next();
});

// store user in the request
app.use((req, res, next) => {
    if (!req.session.user) return next();
    User.findById(req.session.user._id)
        .then(user => {
            if (!user) return next();
            req.user = user;
            next();
        })
        .catch(err => {
            next(new Error(err));
        })
});

// router middlewares
app.use('/admin', adminRoutes); // filter paths to /admin
app.use(shopRoutes);
app.use(authRoutes);

// catch 500 errors
app.get("/500", errorControllers.get500);

// catch 404 errors
app.use(errorControllers.get404);

// error handling middleware
app.use((error, req, res, next) => {
    res.redirect("/500");
});

// Mongoose
mongoose
    .connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(result => {
        app.listen(3000); // start server
    })
    .catch(err => {
        console.log(err);
    });
    