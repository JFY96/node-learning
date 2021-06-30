const fs = require("fs");
const path = require("path");

const PDFDocument = require("pdfkit");

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
};

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
};

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
};

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
};

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
};

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
};

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
};

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
};

exports.getInvoice = (req, res, next) => {
    const orderId = req.params.orderId;
    Order.findById(orderId).then(order => {
        if (!order) return next(new Error("Order not found"));
        if (order.user.userId.toString() === req.user._id.toString()) {
            return next(new Error("Unauthorized"));
        }
        const invoiceName = "invoice-" + orderId + ".pdf";
        const invoicePath = path.join("data", "invoices", invoiceName);

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", 'attachment; filename="' + invoiceName + '"');

        // create new PDF document on 
        const pdfDoc = new PDFDocument();
        pdfDoc.pipe(fs.createWriteStream(invoicePath));
        pdfDoc.pipe(res);

        pdfDoc.fontSize(26).text("Order Summary", {
            underline: true,
        });
        pdfDoc.text("---------------------");
        let totalPrice = 0;
        order.products.forEach(product => {
            pdfDoc.fontSize(14).text(product.product.title +  " - x" + product.qty + ' - $' + product.product.price);
            totalPrice += product.qty * product.product.price;
        });
        pdfDoc.text("");
        pdfDoc.text("Total Price: $" + totalPrice);

        pdfDoc.end();

        // read file and then serve to client
        // fs.readFile(invoicePath, (err, data) => {
        //     if (err) {
        //         return next(err);
        //     }
        //     // Serve file to client
        //     res.setHeader("Content-Type", "application/pdf");
        //     res.setHeader("Content-Disposition", 'attachment; filename="' + invoiceName + '"');
        //     res.send(data);
        // });

        // stream file to client
        const file = fs.createReadStream(invoicePath);
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", 'attachment; filename="' + invoiceName + '"');
        file.pipe(res);
    }).catch(next);
};