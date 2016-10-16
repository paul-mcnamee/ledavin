var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
    code: {type: String, required: true},
    type: {type: String, required: true},
    description: {type: String, required: true},
    percentage: {type: Number, required: true},
    product_id: {type: Schema.Types.ObjectId, ref: 'Product', required: false}
});

module.exports = mongoose.model('Coupon', schema);