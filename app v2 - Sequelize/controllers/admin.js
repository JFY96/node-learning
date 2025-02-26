const Product = require("../models/product");

exports.getAddProduct = (req, res, next) => {
    res.render('admin/edit-product', {
        title: 'Add Product',
        path: '/admin/add-product',
        editing: false
    });
};

exports.getEditProduct = (req, res, next) => {
    const edit = req.query.edit;
    if (!edit) return res.redirect("/");
    const productId = req.params.productId;
    req.user.getProducts({ where: {id: productId}})
        .then(products => {
            const product = products[0];
            if (!product) return res.redirect("/");
            res.render("admin/edit-product", {
                path: "/admin/edit-product",
                title: "Edit Product",
                product,
                editing: true,
            });
        })
        .catch(err => {
            console.log(err);
        });
};

exports.postAddProduct = (req, res, next) => {
    const title = req.body.title;
    const imageUrl = req.body.imageUrl;
    const desc = req.body.desc;
    const price = req.body.price;
    // Product.create({
    req.user
        .createProduct({
            title: title,
            desc: desc,
            price: price,
            imageUrl: imageUrl,
            // userId: req.user.id
        })
        .then(result => {
            res.redirect("/admin/products");
        })
        .catch(err => {
            console.log(err);
        })
};

exports.postEditProduct = (req, res, next) => {
    const productId = req.body.productId;
    const title = req.body.title;
    const desc = req.body.desc;
    const price = req.body.price;
    const imageUrl = req.body.imageUrl;
    Product.findByPk(productId)
        .then(product => {
            product.title = title;
            product.desc = desc;
            product.price = price;
            product.imageUrl = imageUrl;
            return product.save();
        })
        .then(result => {
            res.redirect("/admin/products");
        })
        .catch(err => {
            console.log(err);
        });
}

exports.postDeleteProduct = (req, res, next) => {
    const productId = req.body.productId;
    Product.findByPk(productId)
        .then(product => {
            return product.destroy();
        })
        .then(result => {
            res.redirect("/admin/products");
        })
        .catch(err => {
            console.log(err);
        });
}

exports.getProducts = (req, res, next) => {
    req.user.getProducts()
        .then(products => {
            res.render("admin/products", {
                path: "/admin/products",
                title: "Admin Products", 
                products,
            });
        });
}