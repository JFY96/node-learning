const Product = require("../models/product");
const Cart = require("../models/cart");

exports.getProducts = (req, res, next) => {
    Product.fetchAll()
        .then(([rows, fieldData]) => {
            res.render("shop/product-list", {
                path: "/products",
                title: "All Products",
                products: rows,
            });
        })
        .catch(err => {
            console.log(err)
        });
}

exports.getProduct = (req, res, next) => {
    const productId = req.params.productId;
    Product
        .findById(productId)
        .then(([products]) => {
            res.render("shop/product-detail", {
                path: "/products",
                title: products[0].title,
                product: products[0]
            });
        })
        .catch(err => {
            console.log(err);
        });
}

exports.getIndex = (req, res, next) => {
    Product.fetchAll()
        .then(([rows, fieldData]) => {
            res.render("shop/index", {
                path: "/",
                title: "Shop",
                products: rows,
            });
        })
        .catch(err => {
            console.log(err)
        });
}

exports.getCart = (req, res, next) => {
    Cart.getCart(cart => {
        Product.fetchAll(products => {
            const cartProducts = [];
            for (product of products) {
                const cartProductData = cart.products.find(prod => prod.id === product.id);
                if (cartProductData) {
                    cartProducts.push({productData: product, qty: cartProductData.qty });
                }
            }
            res.render("shop/cart", {
                path: "/cart",
                title: "Your Cart",
                products: cartProducts,
            });
        });
    });
}

exports.postCart = (req, res, next) => {
    const productId = req.body.productId;
    Product.findById(productId, product => {
        Cart.addProduct(product.id, product.price);
    });
    res.redirect('/cart');
}

exports.postDeleteCartItem = (req, res, next) => {
    const productId = req.body.productId;
    Product.findById(productId, product => {
        Cart.deleteProduct(product.id, product.price);
    });
    res.redirect('/cart');
}

exports.getOrders = (req, res, next) => {
    Product.fetchAll(products => {
        res.render("shop/orders", {
            path: "/orders",
            title: "Your Orders",
            products,
        });
    });
}

exports.getCheckout = (req, res, next) => {
    Product.fetchAll(products => {
        res.render("shop/checkout", {
            path: "/checkout",
            title: "Checkout",
            products,
        })
    }) 
}