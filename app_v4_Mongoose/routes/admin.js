const express = require('express'); 
const { body } = require("express-validator");

const controller = require("../controllers/admin");
const isAuth = require("../middleware/is-auth");

const router = express.Router();

router.get('/add-product', isAuth, controller.getAddProduct);

router.get('/products', isAuth, controller.getProducts);

router.get('/edit-product/:productId', isAuth, controller.getEditProduct);

router.post('/add-product', 
    [
        body("title")
            .isString()
            .isLength({ min: 3 })
            .trim(),
        // body("imageUrl")
        //     .isURL(),
        body("price")
            .isFloat(),
        body("desc")
            .trim()
            .isLength({ min: 5, max: 400 }),
    ],
    isAuth, 
    controller.postAddProduct
);

router.post('/edit-product', 
    [
        body("title")
            .isString()
            .isLength({ min: 3 })
            .trim(),
        // body("imageUrl")
        //     .isURL(),
        body("price")
            .isFloat(),
        body("desc")
            .trim()
            .isLength({ min: 5, max: 400 }),
    ],
    isAuth, 
    controller.postEditProduct
);

router.post('/delete-product', isAuth, controller.postDeleteProduct);

module.exports = router;
