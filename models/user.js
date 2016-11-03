var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');

var userSchema = new Schema({
    email: {type: String, required: true},
    password: {type: String, required: true},
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    //TODO: need a mapping for different levels at some point probably
    //for now, admin=700, tailor=400, customer=0
    permissions: {type: Object, required: true, default: {level: 0, group: 'users'}},
    cart: {type: Object, required: false}, //current items in cart
    orders: {type: Array, required: false}, //customer orders
    measurements: {type: Array, required: false}, //measurement sets
    contacts: {type: Array, required: false}, //contact info
    userData: {type: Object, required: false} //eventually we would probably collect usage info, probably don't need this now
});


/**
 * generate the coupons that the user had already entered (should be singular currently since we delete the old one)
 * @returns {Array}
 */
this.generateMeasurementsArray = function() {
    var arr = [];
    for (var measurement in this.measurements){
        arr.push(this.measurements[measurement]);
    }
    return arr;
};


/**
 * generate the coupons that the user had already entered (should be singular currently since we delete the old one)
 * @returns {Array}
 */
this.generateContactsArray = function() {
    var arr = [];
    for (var contact in this.contacts){
        arr.push(this.contacts[contact]);
    }
    return arr;
};

userSchema.methods.encryptPassword = function(password) {
 return bcrypt.hashSync(password, bcrypt.genSaltSync(5), null);
};

userSchema.methods.validPassword = function(password){
  return bcrypt.compareSync(password, this.password);
};

module.exports = mongoose.model('User', userSchema);