const Product = require("../models/product");
const Order = require("../models/order");

exports.getProducts = (req, res, next) => {
    Product.find()
        .then(products => {
            res.render("shop/product-list", {
                path: "/products",
                title: "All Products",
                products,
                
            });
        })
        .catch(err => {
            console.log(err);
        });
}

exports.getProduct = (req, res, next) => {
    const productId = req.params.productId;
    Product.findById(productId)
        .then(product => {
            res.render("shop/product-detail", {
                path: "/products",
                title: product.title,
                product: product,
                
            });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
}

exports.getIndex = (req, res, next) => {
    Product.find()
        .then(products => {
            res.render("shop/index", {
                path: "/",
                title: "Shop",
                products,
            });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
}

exports.getCart = (req, res, next) => {
    req.user
        .populate("cart.items.productId")
        .execPopulate()
        .then(user => {
            res.render("shop/cart", {
                path: "/cart",
                title: "Your Cart",
                products: user.cart.items,
                
            });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
}

exports.postCart = (req, res, next) => {
    const productId = req.body.productId;
    Product.findById(productId)
        .then(product => {
            return req.user.addToCart(product);
        })
        .then(result => {
            res.redirect('/cart');
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
}

exports.postDeleteCartItem = (req, res, next) => {
    const productId = req.body.productId;
    req.user
        .removeFromCart(productId)
        .then(result => {
            res.redirect('/cart');
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
}

exports.postCreateOrder = (req, res, next) => {
    req.user
        .populate("cart.items.productId")
        .execPopulate()
        .then(user => {
            const items = user.cart.items.map(i => {
                return { qty: i.qty, product: { ...i.productId._doc } };
            });

            const order = new Order({
                user: {
                    email: req.user.email,
                    userId: req.user
                },
                items: items
            });

            return order.save();
        })
        .then(result => {
            req.user.clearCart();
        })
        .then(result => {
            res.redirect("/orders");
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
}

exports.getOrders = (req, res, next) => {
    Order.find({ "user.userId": req.user._id })
        .then(orders => {
            res.render("shop/orders", {
                path: "/orders",
                title: "Your Orders",
                orders,
                
            });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
}