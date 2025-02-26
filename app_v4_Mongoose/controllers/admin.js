const { validationResult } = require("express-validator");

const fileHelper = require("../utils/file");
const Product = require("../models/product");


exports.getAddProduct = (req, res, next) => {
    res.render('admin/edit-product', {
        title: 'Add Product',
        path: '/admin/add-product',
        editing: false,
        hasError: false,
        errorMessage: null,
        validationErrors: [],
    });
};

exports.getEditProduct = (req, res, next) => {
    const edit = req.query.edit;
    if (!edit) return res.redirect("/");
    const productId = req.params.productId;
    Product.findById(productId)
        .then(product => {
            if (!product) return res.redirect("/");
            res.render("admin/edit-product", {
                path: "/admin/edit-product",
                title: "Edit Product",
                product,
                editing: true,
                hasError: false,
                errorMessage: null,
                validationErrors: [],
            });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.postAddProduct = (req, res, next) => {
    const title = req.body.title;
    const desc = req.body.desc;
    const price = req.body.price;
    const image = req.file;
    if (!image) {
        return res.status(422).render("admin/edit-product", {
            path: "/admin/add-product",
            title: "Add Product",
            product: {
                title,
                desc,
                price,
            },
            editing: false,
            hasError: true,
            errorMessage: "Attached file is not an image",
            validationErrors: [],
        });
    }
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).render("admin/edit-product", {
            path: "/admin/add-product",
            title: "Add Product",
            product: {
                title,
                desc,
                price,
            },
            editing: false,
            hasError: true,
            errorMessage: errors.array()[0].msg,
            validationErrors: errors.array(),
        });
    }

    const imageUrl = image.path;

    const product = new Product({
        title: title,
        desc: desc,
        price: price,
        imageUrl: imageUrl,
        userId: req.user._id
    });
    product
        .save()
        .then(result => {
            res.redirect("/admin/products");
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.postEditProduct = (req, res, next) => {
    const productId = req.body.productId;
    const title = req.body.title;
    const desc = req.body.desc;
    const price = req.body.price;
    const image = req.file;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).render("admin/edit-product", {
            path: "/admin/edit-product",
            title: "Edit Product",
            product: {
                _id: productId,
                title,
                desc,
                price,
            },
            editing: true,
            hasError: true,
            errorMessage: errors.array()[0].msg,
            validationErrors: errors.array(),
        });
    }

    Product.findById(productId)
        .then(product => {
            if (product.userId.toString() !== req.user._id.toString()) {
                return res.redirect("/");
            }
            product.title = title;
            product.price = price;
            product.desc = desc;
            if (image) {
                fileHelper.deleteFile(product.imageUrl);
                product.imageUrl = image.path;
            }
            return product
                .save()
                .then(result => {
                    res.redirect("/admin/products");
                });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
}

exports.postDeleteProduct = (req, res, next) => {
    const productId = req.body.productId;
    Product
        .findById(productId)
        .then(product => {
            if (!product) return next(new Error("Product not found."));
            fileHelper.deleteFile(product.imageUrl);
            return Product
                .deleteOne({ _id: productId, userId: req.user._id });
        })
        .then(result => {
            res.redirect("/admin/products");
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
}

exports.getProducts = (req, res, next) => {
    Product.find({ userId: req.user._id })
        .populate("userId")
        .then(products => {
            res.render("admin/products", {
                path: "/admin/products",
                title: "Admin Products", 
                products,
            });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
}