const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    cart: {
        items: [
            {
                productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
                qty: { type: Number, requried: true }
            }
        ]
    }
});

userSchema.methods.addToCart = function(product) {
    const cartProductIndex = this.cart.items.findIndex(p => {
        return p.productId.toString() === product._id.toString();
    });
    const updatedCartItems = [...this.cart.items];
    if (cartProductIndex >= 0) {
        updatedCartItems[cartProductIndex].qty = this.cart.items[cartProductIndex].qty + 1;
    } else {
        updatedCartItems.push({ productId: product._id, qty: 1 })
    }
    const updatedCart = { items: updatedCartItems };
    this.cart = updatedCart;
    return this.save();
}

userSchema.methods.removeFromCart = function(productId) {
    const updatedCartItems = this.cart.items.filter(i => {
        return i.productId.toString() !== productId.toString();
    });
    this.cart.items = updatedCartItems;
    return this.save();
}

userSchema.methods.clearCart = function() {
    this.cart = { items: [] };
    return this.save();
}

module.exports = mongoose.model("User", userSchema);