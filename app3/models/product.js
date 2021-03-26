const db = require("../utils/database.js");

const Cart = require("./cart");

module.exports = class Product {
    constructor(id = null, title, imageUrl, desc, price) {
        this.id = id;
        this.title = title;
        this.desc = desc;
        this.price = price;
        this.imageUrl = imageUrl;
    }

    save() {
        return db.execute(
            "INSERT INTO products(title, `desc`, price, imageUrl) VALUES(?,?,?,?)",
            [this.title, this.desc, this.price, this.imageUrl]
        );
    }

    static fetchAll() {
        return db.execute("SELECT * FROM products"); // return promise
    }
    
    static findById(id) {
        return db.execute("SELECT * FROM products WHERE products.id = ?", [id]);
    }

    static deleteById(id) {

    }
}