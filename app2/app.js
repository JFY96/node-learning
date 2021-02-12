const path = require("path");
const express = require('express');
const bodyParser = require('body-parser');

const rootDir = require('./utils/path');

const app = express();

app.set('view engine', 'ejs');

const adminData = require('./routes/admin.js');
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

// router middlewares
app.use('/admin', adminData.routes); // filter paths to /admin
app.use(shopRoutes);

// catch 404 errors
app.use((req, res, next) => {
    res.status(404).render('404', {title: 'Page Not Found'});
});

// const server = http.createServer(app);
// server.listen(3000);
app.listen(3000); // equivalent to the above, so do not need to have http import