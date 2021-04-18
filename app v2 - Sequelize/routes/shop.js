const path = require('path');
const express = require('express');

const controller = require("../controllers/shop");

const router = express.Router();

router.get('/', controller.getIndex); // homepage

router.get('/products', controller.getProducts);

router.get('/products/:productId', controller.getProduct);

router.get('/cart', controller.getCart);

router.post('/cart', controller.postCart);

router.post('/cart-delete-item', controller.postDeleteCartItem);

router.get('/orders', controller.getOrders);

router.post('/create-order', controller.postCreateOrder);

module.exports = router;