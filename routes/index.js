var express = require('express');
var router = express.Router();
var Cart = require('../models/cart');
var Product = require('../models/product');
var Coupon = require('../models/coupon');
var Order = require('../models/order');
var Common = require('../routes/common.js');

/* GET home page. */
router.get('/', function(req, res, next) {
    var successMsg = req.flash('success')[0];
    Product.find(function (err, docs) {

        var products = [];
        for (var p=0; p < docs.length; p++){
            products.push(docs[p])
        }

        var materialsToFilter = [];
        var colorsToFilter = [];

        //loop through the products to find filter info
        for (var k=0; k < docs.length; k++){

            //find a unique list of materials in the products to filter by
            var materialPaths = docs[k].materials;
            for (var j=0; j < materialPaths.length; j++)
            {
                if (!Common.isInArray(docs[k].materials[j].link, materialsToFilter))
                {
                    materialsToFilter.push([docs[k].materials[j].name, docs[k].materials[j].link])
                }
            }

            //find a unique list of colors in the products to filter by
            var colors = docs[k].colors;
            for (var l=0; l < colors.length; l++){
                if (!Common.isInArray(docs[k].colors[l], colorsToFilter))
                {
                    colorsToFilter.push(docs[k].colors[l])
                }
            }
        }

        res.render('shop/index', {
            title: 'Le Davin Custom Clothier',
            products: products,
            materialsToFilter: materialsToFilter,
            colorsToFilter: colorsToFilter,
            successMsg: successMsg,
            noMessage: !successMsg
        });
    });
});

router.get('/contact', function(req, res, next) {
    res.render('shop/contact')
});

/* GET the product and addItem it to the cart */
router.get('/product/:id', function(req, res, next){
    var productId = req.params.id;

    Product.findById(productId, function(err, product) {

        if (err){
            //todo: display the errors
            return res.redirect('/');
        }

        //console.log(req.session.cart);
        res.render('shop/product', {product: product});
    });
});

/* GET the product and addItem it to the cart */
router.get('/add-to-cart/:id', function(req, res, next){
    var productId = req.params.id;
    var cart = new Cart(req.session.cart ? req.session.cart : {});

    Product.findById(productId, function(err, product) {

        if (err){
           //todo: display the errors
           return res.redirect('/');
       }

        //just make measurement id 0 for now so it uses the first measurement in the list
        cart.addItem(product, product.id);
        req.session.cart = cart;

        //console.log(req.session.cart);
        res.redirect('/');
    });
});

/* GET the product id and removeItem it from the cart */
router.get('/remove-from-cart/:id', function(req, res, next){
    var productId = req.params.id;
    var cart = new Cart(req.session.cart ? req.session.cart : {});

    Product.findById(productId, function(err, product) {
        if (err){
            //todo: display the errors
            return res.redirect('/');
        }

        cart.removeItem(product, product.id, 1);
            //console.log("there was no product to removeItem from the cart for cart =" + req.session.cart);
        req.session.cart = cart;

        //console.log("cart contents=" + req.session.cart);
        res.redirect('/');
    });
});

router.get('/checkout', Common.isLoggedIn,
    function(req, res, next){
        //TODO: calculate the shipping costs
        next();
    },

    function(req, res, next){
        //TODO: calculate the tax costs
        next();
    },

    function(req, res, next) {
    if (!req.session.cart){
        return res.redirect('shop/cart', {products: null});
    }

    //TODO: check for measurements and shipping contact
    var cart = new Cart(req.session.cart ? req.session.cart : {});
    var errMsg = req.flash('error')[0];


    res.render('shop/checkout', {
        total: cart.totalPrice,
        errMsg: errMsg,
        noError: !errMsg,
        products: cart.generateArray(),
        totalPrice: cart.totalPrice,
        totalQuantity: cart.totalQuantity,
        coupons: cart.generateCouponsArray(),
        totalDiscount: cart.totalDiscount,
        subtotal: cart.subtotal,
        selectedMeasurements: cart.selectedMeasurements,
        selectedContact: cart.selectedContact
    });
});

router.post('/checkout', Common.isLoggedIn, function(req, res, next) {
    if (!req.session.cart){
        return res.redirect('shop/cart', {products: null});
    }

    //make sure the user is logged in
    if (!req.user){
        return res.redirect('user/signin');
    }

    //TODO: validate the name and address

    //get the cart and start the payment processing
    var cart = new Cart(req.session.cart ? req.session.cart : {});

    //TODO: PROD: change this for production, add it to a secure config
    var stripe = require("stripe")(
        "sk_test_p7glF9ZlQc1qbfMqBXrAWbLI"
    );

    var successMessage = 'Thanks for shopping with LeDaVin!';

    stripe.charges.create({
        amount: cart.totalPrice * 100, //price is sent in cents USD
        currency: "usd",
        source: req.body.stripeToken, // obtained with Stripe.js
        description: "Test Charge" //TODO: need to change the charge description
    }, function(err, charge) {
        // asynchronously called
        if (err){
            req.flash('error', err.message);
            return res.redirect('/checkout');
        }

        //order billing information
        var billing = {
            name: req.body.name,
            address: req.body.address
        };

        //order shipping information
        var shipping = {
            contact: cart.selectedContact
        };

        //TODO: eventually we would have some information for tracking numbers from the carriers
        //order tracking information
        var tracking = {
            trackingNumber: '',
            carrierId: 0
        };

        var order = new Order({
            user: req.user,
            cart: cart,
            billing: billing,
            shipping: shipping,
            tracking: tracking,
            paymentId: charge.id
        });
        order.save(function(err, result){
            if (err){
                req.flash('error', err.message);
                return res.redirect('/checkout');
            }
            req.flash('success', successMessage);
            req.session.cart = {};
            res.redirect('/');
        });
    });
});

module.exports = router;