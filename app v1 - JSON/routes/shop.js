const path = require('path');
const express = require('express');

const controller = require("../controllers/shop");

const router = express.Router();

// homepage
router.get('/', controller.getIndex);

router.get('/products', controller.getProducts);

router.get('/products/:productId', controller.getProduct);

router.get('/cart', controller.getCart);

router.post('/cart', controller.postCart);

router.post('/cart-delete-item', controller.postDeleteCartItem);

router.get('/orders', controller.getOrders);

router.get('/checkout', controller.getCheckout);

module.exports = router;