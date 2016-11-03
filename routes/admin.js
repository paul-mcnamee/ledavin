var express = require('express');
var router = express.Router();
var Product = require('../models/product');
var Order = require('../models/order');
var Cart = require('../models/cart');
var User = require('../models/user.js');
var csrf = require('csurf');
var Common = require('../routes/common.js');

var csrfProtection = csrf();
router.use(csrfProtection);

router.use(function (req, res, next){
    res.locals._csrf = req.csrfToken();
    next();
});

router.get('/home', Common.isLoggedIn, Common.hasAdminPermissions, function(req, res, next) {
    res.render('admin/home', {
        csrfToken: req.csrfToken()
    })
});

router.get('/orders', Common.isLoggedIn, Common.hasAdminPermissions, function(req, res, next) {
    //order schema
    //user: {type: Schema.Types.ObjectId, ref: 'User'}, //store the user id
    //cart: {type: Object, required: true}, //cart from the user session
    //orderCreated: {type: Date, default: Date.now},
    //billing: {type: Object, required: true}, //payment type, payment info, actually received payment, etc.
    //shipping: {type: Object, required: true}, //address, shipping method,
    //tracking: {type: Object, required: true} //carrier, trackingID, ...

    var orders = Order.find({}).sort('orderCreated').limit(2).exec(function(err, docs) {
    });

    res.render('admin/orders', {
        orders: orders,
        csrfToken: req.csrfToken()
    })
});

router.get('/products', Common.isLoggedIn, Common.hasAdminPermissions, function(req, res, next) {
    //product schema
    //imagePaths: {type: Object, required: true},
    //type: {type: String, required: false}, //shirt, pants, etc.
    //title: {type: String, required: true},
    ////as it stands we should only have 1 color and material per item but we might want more in the future
    //colors: {type: Array, required: true, default: ['red']},
    //materials: {type: Array, required: true, default: [{ name: 'cotton', link: 'http://3v6x691yvn532gp2411ezrib.wpengine.netdna-cdn.com/wp-content/uploads/sites/default/files/20130830-adc.png'}]},
    //description: {type: String, required: true},
    //price: {type: Number, required: true}

    var products = Product.find({}).sort('title').limit(10).exec(function(err, docs) {
    });

    res.render('admin/products', {
        products: products,
        csrfToken: req.csrfToken()
    })
});

module.exports = router;