var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
    //TODO: we will have multiple images so this needs to be an array with the main image as the first element in the array
    imagePaths: {type: Object, required: true},
    type: {type: String, required: false}, //shirt, pants, etc.
    title: {type: String, required: true},
    //as it stands we should only have 1 color and material per item but we might want more in the future
    colors: {type: Array, required: true, default: ['red']},
    materials: {type: Array, required: true, default: [{ name: 'cotton', link: 'http://3v6x691yvn532gp2411ezrib.wpengine.netdna-cdn.com/wp-content/uploads/sites/default/files/20130830-adc.png'}]},
    description: {type: String, required: true},
    price: {type: Number, required: true}
});

module.exports = mongoose.model('Product', schema);