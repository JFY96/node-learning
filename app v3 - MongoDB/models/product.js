const mongodb = require("mongodb");
const getDb = require("../utils/database").getDb;

class Product {
    constructor(title, desc, price, imageUrl, id, userId) {
        this.title = title;
        this.price = price;
        this.desc = desc;
        this.imageUrl = imageUrl;
        this._id = id ? new mongodb.ObjectId(id) : null;
        this.userId = userId;
    }
    
    save() {
        const db = getDb();
        let dbOperation;
        if (this._id) {
            // Update
            dbOperation = db.collection("products")
                .updateOne({_id: this._id}, {$set: this});
        } else {
            // Insert
            dbOperation = db.collection("products").insertOne(this);
        }
        return dbOperation
            .then(result => {
                console.log(result);
            })
            .catch(err => {
                console.log(err);
            });
    }

    static fetchAll() {
        const db = getDb();
        return db
            .collection("products")
            .find()
            .toArray() // for now just convert to array (works fine for small data set)
            .then(products => {
                return products;
            })
            .catch(err => {
                console.log(err);
            });
    }

    static findById(productId) {
        const db = getDb();
        return db.collection("products")
            .find({_id: new mongodb.ObjectId(productId)})
            .next()
            .then(product => {
                return product;
            })
            .catch(err => {
                console.log(err);
            });
    }

    static deleteById(productId) {
        const db = getDb();
        return db.collection("products")
            .deleteOne({_id: new mongodb.ObjectId(productId)})
            .then(result => {

            })
            .catch(err => {
                console.log(err);
            })
    }
}

module.exports = Product;