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

/* GET the cart */
router.get('/', Common.isLoggedIn, function(req, res, next) {
    if (!req.session.cart){
        return res.render('shop/cart', {products: null});
    }

    var cart = new Cart(req.session.cart);
    var measurements = req.user.measurements;
    var contacts = req.user.contacts;

    //add default measurements to the cart if a measurement set exists
    if (!cart.hasOwnProperty("selectedMeasurements") || !cart.selectedMeasurements.hasOwnProperty("measurementDescription")){
        if (measurements[0] != null){
            cart.updateMeasurements(measurements[0]);
            req.session.cart = cart;
        }
    }

    //add default contact to the cart if a contact exists
    if (!cart.hasOwnProperty("selectedContact") || !cart.selectedContact.hasOwnProperty("description")){
        if (contacts[0] != null){
            cart.updateContact(contacts[0]);
            req.session.cart = cart;
        }
    }

    res.render('shop/cart', {
        products: cart.generateArray(),
        totalPrice: cart.totalPrice,
        totalQuantity: cart.totalQuantity,
        coupons: cart.generateCouponsArray(),
        totalDiscount: cart.totalDiscount,
        selectedMeasurements: cart.selectedMeasurements,
        selectedContact: cart.selectedContact,
        measurements: measurements,
        contacts: contacts,
        csrfToken: req.csrfToken()
    })
});

router.get('/updateMeasurement/:id', function(req, res, next) {
    if (!req.session.cart){
        return res.render('shop/cart', {products: null});
    }
    var cart = new Cart(req.session.cart);
    var measurements = req.user.measurements;
    var measurementId = req.params.id;

    if (measurements[measurementId] != null){
        cart.updateMeasurements(measurements[measurementId]);
        req.session.cart = cart;
    }

    res.redirect(req.get('referer'));
});

router.get('/updateContact/:id', function(req, res, next) {
    if (!req.session.cart){
        return res.render('shop/cart', {products: null});
    }
    var cart = new Cart(req.session.cart);
    var contacts = req.user.contacts;
    var contactId = req.params.id;

    if (contacts[contactId] != null){
        cart.updateContact(contacts[contactId]);
        req.session.cart = cart;
    }

    res.redirect(req.get('referer'));
});


/* GET the product id and quantity update the quantity in the cart */
router.get('/update-item-in-cart/:id/:qty', function(req, res, next){
    var productId = req.params.id;
    var qty = req.params.qty;

    var cart = new Cart(req.session.cart ? req.session.cart : {});

    Product.findById(productId, function(err, product) {
        if (err){
            //todo: display the errors
            return res.redirect('/cart');
        }

        cart.updateItemQuantity(product, product.id, qty);
        //console.log("there was no product to removeItem from the cart for cart =" + req.session.cart);
        req.session.cart = cart;

        //console.log("cart contents=" + req.session.cart);
        res.redirect('/cart');
    });
});

/* GET the coupon id and update the cart */
router.get('/apply-coupon/:code', function(req, res, next){
    var couponCode = req.params.code;

    var cart = new Cart(req.session.cart ? req.session.cart : {});

    Coupon.findOne({"code": "" + couponCode}, function(err, coupon) {
        if (err || (coupon == "undefined") || (coupon == null)){
            //todo: display the errors
            return res.redirect('/cart');
        }

        cart.addCoupon(coupon.id, coupon.code, coupon.product_id, coupon.percentage, coupon.type, coupon.description);

        req.session.cart = cart;

        //console.log("cart contents=" + req.session.cart);
        res.redirect('/cart');
    });
});

router.post('/', Common.isLoggedIn, function(req, res, next) {
    if (!req.session.cart){
        return res.render('shop/cart', {products: null});
    }

    var cart = req.session.cart;
    var measurements = req.user.measurements;
    var contacts = req.user.contacts;

    var itemCounter = 0;
    for (var item in cart.items){
        if (cart.items.hasOwnProperty(item)){
            cart.items[item].measurements = {
                //not sure how to get the req.item.shoulderSlope + itemId
                shoulderSlope: req.body.ShoulderSlope[itemCounter],
                tuckPreference: req.body.TuckPreference[itemCounter],
                fit: req.body.Fit[itemCounter]
            };
        }
        itemCounter++;
    }

    //update the cart so the new measurements are saved
    req.session.cart = cart;

    res.redirect('/checkout')
});

module.exports = router;

