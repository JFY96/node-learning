const Product = require("../models/product");

exports.getProducts = (req, res, next) => {
    Product.findAll()
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
    // Product.findAll({ where: { id: productId } })
    Product.findByPk(productId)
        .then(product => {
            res.render("shop/product-detail", {
                path: "/products",
                title: product.title,
                product: product
            });
        })
        .catch(err => {
            console.log(err);
        });
}

exports.getIndex = (req, res, next) => {
    Product.findAll()
        .then(products => {
            res.render("shop/index", {
                path: "/",
                title: "Shop",
                products,
            });
        })
        .catch(err => {
            console.log(err);
        });
}

exports.getCart = (req, res, next) => {
    req.user
        .getCart()
        .then(cart => {
            return cart.getProducts();
        })
        .then(products => {
            res.render("shop/cart", {
                path: "/cart",
                title: "Your Cart",
                products: products,
            });
        })
        .catch(err => {
            console.log(err);
        });
}

exports.postCart = (req, res, next) => {
    const productId = req.body.productId;
    let fetchedCart;
    let newQty = 1;
    req.user
        .getCart()
        .then(cart => {
            fetchedCart = cart;
            return cart.getProducts({where: {id: productId}});
        })
        .then(products => {
            const product = products.length > 0 ? products[0] : null;
            if (product) {
                newQty = product.cartItem.qty + 1;
                return product;
            }
            return Product.findByPk(productId);
        })
        .then(product => {
            return fetchedCart.addProduct(product, { through: { qty: newQty } });
        })
        .then(cart => {
            res.redirect('/cart');
        })
        .catch(err => {
            console.log(err);
        });
}

exports.postDeleteCartItem = (req, res, next) => {
    const productId = req.body.productId;
    req.user
        .getCart()
        .then(cart => {
            return cart.getProducts({ where: { id: productId }});
        })
        .then(products => {
            const product = products[0];
            return product.cartItem.destroy();
        })
        .then(result => {
            res.redirect('/cart');
        })
        .catch(err => {
            console.log(err);
        });
}

exports.postCreateOrder = (req, res, next) => {
    let fetchedCart;
    req.user
        .getCart()
        .then(cart => {
            fetchedCart = cart;
            return cart.getProducts();
        })
        .then(products => {
            return req.user
                .createOrder()
                .then(order => {
                    order.addProducts(products.map(product => {
                        product.orderItem = { qty: product.cartItem.qty };
                        return product;
                    }));
                })
                .catch(err => {
                    console.log(err);
                });
        })
        .then(result => {
            return fetchedCart.setProducts(null); // empty the cart
        })
        .then(result => {
            res.redirect("/orders");
        })
        .catch(err => {
            console.log(err);
        })
}

exports.getOrders = (req, res, next) => {
    req.user
        .getOrders({include: ["products"]}) // Eager Loading
        .then(orders => {
            res.render("shop/orders", {
                path: "/orders",
                title: "Your Orders",
                orders,
            });
        })
        .catch(err => {
            consoles.log(err);
        });
}