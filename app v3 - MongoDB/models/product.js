const getDb = require("../utils/database").getDb;

class Product {
    constructor(title, desc, price, imageUrl) {
        this.title = title;
        this.price = price;
        this.desc = desc;
        this.imageUrl = imageUrl;
    }
    
    save() {
        const db = getDb();
        db.collection("products")
            .insertMany(this)
            .then(result => {
                console.log(result);
            })
            .catch(err => {
                console.log(err);
            });
    }

}

module.exports = Product;