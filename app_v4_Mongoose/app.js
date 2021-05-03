const path = require("path");
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require("mongoose");

const errorControllers = require("./controllers/errors");
const User = require("./models/user");
const rootDir = require('./utils/path');
const config = require("./config.json");
const uri = config.db_uri;

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
    User.findById("609060aa6020660d4858b7b7") // hard coded user already created in mongodb
        .then(user => {
            req.user = user;
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

// Mongoose
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(result => {
        User.findOne().then(user => {
            if (!user) {
                const user = new User({
                    name: "Fei",
                    email: "test@test.com",
                    cart: {
                        items: []
                    }
                })
                user.save();
            }
        });
        app.listen(3000); // start server
    })
    .catch(err => {
        console.log(err);
    });
    