const mongodb = require("mongodb");
const getDb = require("../utils/database").getDb;

const ObjectId = mongodb.ObjectId;

class User {
    constructor(username, email, cart, id) {
        this.name = username;
        this.email = email;
        this.cart = cart || {items: []};
        this._id = id;
    }

    save() {
        const db = getDb();
        return db.collection("users")
            .insertOne(this);
    }

    addToCart(product) {
        console.log(this.cart.items);
        console.log()
        const cartProductIndex = this.cart.items.findIndex(p => {
            return p.productId.toString() === product._id.toString();
        });
        const updatedCartItems = [...this.cart.items];
        if (cartProductIndex >= 0) {
            updatedCartItems[cartProductIndex].qty = this.cart.items[cartProductIndex].qty + 1;
        } else {
            updatedCartItems.push({ productId: new ObjectId(product._id), qty: 1 })
        }
        console.log(updatedCartItems);
        const updatedCart = { items: updatedCartItems }
        const db = getDb();
        return db.collection("users")
            .updateOne({ _id: new ObjectId(this._id) }, { $set: { cart: updatedCart } });
        
    }

    getCart() {
        const db = getDb();
        const productIds = this.cart.items.map(i => {
            return i.productId;
        })
        return db.collection("products")
                .find({_id: {$in: productIds}})
                .toArray()
                .then(products => {
                    return products.map(p => {
                        return {
                            ...p, 
                            qty: this.cart.items.find(i => {
                                return i.productId.toString() === p._id.toString();
                            }).qty
                        };
                    });
                });
    }

    deleteItemFromCart(productId) {
        const updatedCartItems = this.cart.items.filter(i => {
            return i.productId.toString() !== productId.toString();
        });
        const db = getDb();
        return db.collection("users")
            .updateOne({ _id: new ObjectId(this._id) }, { $set: { cart: {items: updatedCartItems } } });
    }

    addOrder() {
        const db = getDb();
        return this.getCart()
            .then(products => {
                const order = {
                    items: products,
                    user: {
                        _id: new ObjectId(this._id),
                        name: this.name
                    }
                };
                return db.collection("orders")
                    .insertOne(order);
            })
            .then(result => {
                this.cart = { items: [] };
                return db.collection("users")
                    .updateOne({ _id: new ObjectId(this._id) }, { $set: { cart: { items: [] } } });
            });
    }

    getOrders() {
        const db = getDb();
        return db.collection("orders")
            .find({ "user._id": new ObjectId(this._id) })
            .toArray();
    }

    static findById(userId) {
        const db = getDb();
        return db.collection("users")
            .findOne({_id: new ObjectId(userId)});
    }
}

module.exports = User;