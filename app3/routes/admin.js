const path = require('path');
const express = require('express'); 

const controller = require("../controllers/admin");

const router = express.Router();

// /add-product GET middleware
router.get('/add-product', controller.getAddProduct);

// /add-product POST middleware
router.post('/add-product', controller.postAddProduct);

// /admin/products GET
router.get('/products', controller.getProducts);

// /edit-product GET middleware
router.get('/edit-product/:productId', controller.getEditProduct);

// /edit-product POST middleware
router.post('/edit-product', controller.postEditProduct);

router.post('/delete-product', controller.postDeleteProduct);

module.exports = router;
