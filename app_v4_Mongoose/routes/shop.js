const path = require('path');
const express = require('express');

const controller = require("../controllers/shop");
const isAuth = require("../middleware/is-auth");

const router = express.Router();

router.get('/', controller.getIndex); // homepage

router.get('/products', controller.getProducts);

router.get('/products/:productId', controller.getProduct);

router.get('/cart', isAuth, controller.getCart);

router.get('/orders', isAuth, controller.getOrders);

router.post('/cart', isAuth, controller.postCart);

router.post('/cart-delete-item', isAuth, controller.postDeleteCartItem);

router.post('/create-order', isAuth, controller.postCreateOrder);

router.get("/orders/:orderId", isAuth, shopController.getInvoice);

module.exports = router;