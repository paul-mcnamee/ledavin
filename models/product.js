var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
    imagePath: {type: String, required: true},
    type: {type: String, required: false}, //shirt, pants, etc.
    title: {type: String, required: true},
    colors: {type: Object, required: true, default: {available: ['red', 'blue', 'green'], unavailable: ['pink', 'peach']}},
    material: {type: Object, required: true, default: {type: {available: ['cotton', 'linen'], unavailable: ['wool']}, amount: 5, units: 'yards'}},
    description: {type: String, required: true},
    price: {type: Number, required: true}
});

module.exports = mongoose.model('Product', schema);