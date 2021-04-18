const fs = require("fs");
const path = require("path");
const rootDir = require('../utils/path');

const Cart = require("./cart");

const p = path.join(rootDir, "data", "products.json");

const getProductsFromFile = (callback) => {
    fs.readFile(p, (err, fileContent) => {
        if (err) {
            return callback([]);
        }
        return callback(JSON.parse(fileContent));
    });
}

module.exports = class Product {
    constructor(id = null, title, imageUrl, desc, price) {
        this.id = id;
        this.title = title;
        this.imageUrl = imageUrl;
        this.desc = desc;
        this.price = price;
    }

    save() {
        getProductsFromFile(products => {
            let updatedProducts;
            if (this.id) {
                const existingIndex = products.findIndex(product => product.id === this.id);
                updatedProducts = [...products]; // copy
                updatedProducts[existingIndex] = this;
            } else {
                updatedProducts = products; // same object
                this.id = Math.random().toString();
                updatedProducts.push(this);
            }
            fs.writeFile(p, JSON.stringify(updatedProducts), (err) => {
                console.log(err);
            });
        });
    }

    static fetchAll(callback) {
        getProductsFromFile(callback);
    }

    static findById(id, callback) {
        getProductsFromFile(products => {
            const product = products.find(p => p.id === id);
            callback(product);
        });
    }

    static deleteById(id) {
        getProductsFromFile(products => {
            const product = products.find(product => product.id === id);
            const updatedProducts = products.filter(product => product.id !== id);
            fs.writeFile(p, JSON.stringify(updatedProducts), (err) => {
                if (!err) Cart.deleteProduct(id, product.price);
                else console.log(err);
            });
        });
    }
}