const path = require('path');
const express = require('express');

const rootDir = require('../utils/path');
const adminData = require('./admin.js');

const router = express.Router();

// homepage
router.get('/', (req, res, next) => {
    res.render('shop', {
        title: 'Shop', 
        products: adminData.products,
        path: '/'
    });
});

module.exports = router;