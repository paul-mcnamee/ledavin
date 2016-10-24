var express = require('express');
var router = express.Router();
var Cart = require('../models/cart');

var Product = require('../models/product');
var Coupon = require('../models/coupon');
var Order = require('../models/order');

//todo: definitely need to break this out into different route files

/* GET home page. */
router.get('/', function(req, res, next) {
    var successMsg = req.flash('success')[0];
    Product.find(function (err, docs) {

        var products = [];
        for (var p=0; p < docs.length; p++){
            products.push(docs[p])
        }

        //break the products up into chunks of 3 to display on the page
        //var productChunks = [];
        //var chunkSize = 3;
        //for (var i = 0; i < docs.length; i += chunkSize){
        //    productChunks.push(docs.slice(i, i + chunkSize));
        //}

        var materialsToFilter = [];
        var colorsToFilter = [];

        //loop through the products to find filter info
        for (var k=0; k < docs.length; k++){

            //find a unique list of materials in the products to filter by
            var materialPaths = docs[k].materials;
            for (var j=0; j < materialPaths.length; j++)
            {
                if (!isInArray(docs[k].materials[j].link, materialsToFilter))
                {
                    materialsToFilter.push([docs[k].materials[j].name, docs[k].materials[j].link])
                }
            }

            //find a unique list of colors in the products to filter by
            var colors = docs[k].colors;
            for (var l=0; l < colors.length; l++){
                if (!isInArray(docs[k].colors[l], colorsToFilter))
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

/* GET the cart */
router.get('/cart', isLoggedIn, function(req, res, next) {
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
        contacts: contacts
    })
});

router.get('/cart/updateMeasurement/:id', function(req, res, next) {
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

router.get('/cart/updateContact/:id', function(req, res, next) {
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
router.get('/cart/update-item-in-cart/:id/:qty', function(req, res, next){
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
router.get('/cart/apply-coupon/:code', function(req, res, next){
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

router.post('/cart', isLoggedIn, function(req, res, next) {
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

router.get('/checkout', isLoggedIn, function(req, res, next) {
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

router.post('/checkout', isLoggedIn, function(req, res, next) {
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
            carrierId: 0,
            estimatedArrival: Date.now()
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

function isLoggedIn(req, res, next){
    if (req.isAuthenticated()){
        return next();
    }
    //save the url the user came from
    req.session.oldUrl = req.url;
    res.redirect('/user/signin');
}

function isInArray(value, array) {
    return array.indexOf(value) > -1;
}