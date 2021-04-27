const path = require("path");
const express = require('express');
const bodyParser = require('body-parser');

const errorControllers = require("./controllers/errors");
const mongoConnect = require("./utils/database").mongoConnect;
const User = require("./models/user");
const rootDir = require('./utils/path');

const app = express();

app.set('view engine', 'ejs');

const adminRoutes = require('./routes/admin.js');
const shopRoutes = require('./routes/shop.js');

// Parse the request body
app.use(bodyParser.urlencoded({extended: false}));

// Serve static files / register static folder path
app.use(express.static(path.join(rootDir, 'public')));

// log every request
app.use((req, res, next) => {
    console.log(new Date(), req.method, req.url);
    next();
});

// store user in the request
app.use((req, res, next) => {
    User.findById("60849a256694cbbfb1674561") // hard coded user already created in mongodb
        .then(user => {
            req.user = new User(user.name, user.email, user.cart, user._id);
            next();
        })
        .catch(err => {
            console.log(err);
        })
});

// router middlewares
app.use('/admin', adminRoutes); // filter paths to /admin
app.use(shopRoutes);

// catch 404 errors
app.use(errorControllers.get404);

// MongoDB
mongoConnect(() => {
    app.listen(3000); // start server
});