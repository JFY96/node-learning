const fs = require("fs");
const path = require("path");
const rootDir = require('../utils/path');

const p = path.join(rootDir, "data", "cart.json");

module.exports = class Cart {
    static addProduct(id, productPrice) {
        // Fetch the previous cart
        fs.readFile(p, (err, fileContent) => {
            let cart = { products: [], totalPrice: 0 };
            if (!err) cart = JSON.parse(fileContent);
            // Check for existing product
            const existingIndex = cart.products.findIndex(prod => prod.id === id);
            // Add new product / increase qty
            if (existingIndex !== -1) {
                const existing = cart.products[existingIndex];
                cart.products = [...cart.products];
                cart.products[existingIndex] = { ...existing, qty: existing.qty + 1 };
            } else {
                cart.products = [...cart.products, { id: id, qty: 1}];
            }
            cart.totalPrice += productPrice;

            fs.writeFile(p, JSON.stringify(cart), err => {
                console.log(err);
            });
        })
    }

    static deleteProduct(id, productPrice) {
        fs.readFile(p, (err, fileContent) => {
            if (err) return;
            const cart = JSON.parse(fileContent);
            const updatedCart = { ...cart };
            const product = updatedCart.products.find(product => product.id === id);
            if (!product) return;
            const qty = product.qty;
            updatedCart.products = updatedCart.products.filter(product => product.id !== id);
            updatedCart.totalPrice -= qty * productPrice;
            fs.writeFile(p, JSON.stringify(updatedCart), err => {
                console.log(err);
            });
        });
    }

    static getCart(callback) {
        fs.readFile(p, (err, fileContent) => {
            const cart = JSON.parse(fileContent);
            if (err) callback(null);
            else callback(cart);
        })
    }
}