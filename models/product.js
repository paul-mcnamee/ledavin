var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
    //TODO: we will have multiple images so this needs to be an array with the main image as the first element in the array
    imagePaths: {type: Object, required: true},
    type: {type: String, required: false}, //shirt, pants, etc.
    title: {type: String, required: true},
    //as it stands we should only have 1 color and material per item but we might want more in the future
    colors: {type: Object, required: true, default: {available: ['red'], unavailable: ['pink', 'blue', 'green', 'peach']}},
    materials: {type: Object, required: true, default: {type: {available: ['cotton'], unavailable: ['wool', 'linen']}, amount: 5, units: 'yards'}},
    materialPaths: {type: Object, required: true}, //material image paths
    description: {type: String, required: true},
    price: {type: Number, required: true}
});

module.exports = mongoose.model('Product', schema);