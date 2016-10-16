var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//id, items, total cost, discounted cost, coupon code, shipping address, tracking number,

var schema = new Schema({
    user: {type: Schema.Types.ObjectId, ref: 'User'}, //store the user id
    cart: {type: Object, required: true}, //cart from the user session
    orderCreated: {type: Date, default: Date.now},
    billing: {type: Object, required: true}, //payment type, payment info, actually received payment, etc.
    shipping: {type: Object, required: true}, //address, shipping method,
    tracking: {type: Object, required: true} //carrier, trackingID, ...
});

module.exports = mongoose.model('Order', schema);