var express = require('express');
var router = express.Router();
var Product = require('../models/product');
var Order = require('../models/order');
var Cart = require('../models/cart');
var csrf = require('csurf');
var passport = require('passport');
var async = require('async');
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var crypto = require('crypto');
var Common = require('../routes/common.js');


var csrfProtection = csrf();
router.use(csrfProtection);

router.use(function (req, res, next){
    res.locals._csrf = req.csrfToken();
    next();
});

var User = require('../models/user.js');

//protect route for logged in page
router.get('/profile', Common.isLoggedIn, function(req, res, next) {
    var messages = req.flash('error');

    if (!req.user){
        return res.redirect('/signin');
    }


    //data to pass to the form
    var user = new User(req.user ? req.user : {}); //should never be null?
    var email = user.email ? user.email : {};
    var measurements = user.measurements;
    var contacts = user.contacts;

    //TODO: do change password in a separate page or something?

    //find the orders
    Order.find({user: req.user}, function(err, orders) {
        if (err) {
            return res.write('Failed to find orders!');
        }
        var cart;

        orders.forEach(function(order) {
            cart = new Cart(order.cart);
            order.items = cart.generateArray();
        });

    res.render('user/profile', {csrfToken: req.csrfToken(), email: email, measurements: measurements, contacts: contacts, orders: orders, messages: messages, hasErrors: messages.length > 0});
    });
});

router.post('/addMeasurement', Common.isLoggedIn, function(req, res, next){
    var messages = req.flash('error');
    var user = User(req.user);
    if (!req.user){
        return res.redirect('/signin');
    }

    var newMeasurement = {
        measurementDescription: req.body.MeasurementDescription,
        fit: req.body.Fit,
        tuckPreference: req.body.TuckPreference,
        shoulderSlope: req.body.ShoulderSlope,
        units: req.body.Units,          //might be a pain in the ass to convert units, but it's better to specify
        napeOfNeckToButt: req.body.NapeOfNeckToButt,
        acrossBack: req.body.AcrossBack,
        acrossShoulders: req.body.AcrossShoulders,
        ballOfNeckToEdgeOfShoulders: req.body.BallOfNeckToEdgeOfShoulders,
        shoulderToElbow: req.body.ShoulderToElbow,
        elbowToEdgeOfCuff: req.body.ElbowToEdgeOfCuff,
        wrist: req.body.Wrist,
        bicep: req.body.Bicep,
        neck: req.body.Neck,
        chest: req.body.Chest,
        waist: req.body.Waist,
        hips: req.body.Hips
    };

    //TODO: unit conversions?

    var email = req.user.email;
    var contacts = req.user.contacts;

    user.measurements.push(newMeasurement);
    var measurements = user.measurements;
    user.save();

    res.redirect('/user/profile');

    //res.render('user/profile', {csrfToken: req.csrfToken(), email: email, measurements: measurements, contacts: contacts, messages: messages, hasErrors: messages.length > 0});
});

router.get('/addMeasurement', Common.isLoggedIn, function(req, res, next){
    if (!req.user){
        return res.redirect('/signin');
    }

    res.render('user/addMeasurement', {csrfToken: req.csrfToken()});
});

router.get('/removeMeasurement/:id', Common.isLoggedIn, function(req, res, next) {
    var messages = req.flash('error');
    var user = User(req.user);
    if (!req.user){
        return res.redirect('/signin');
    }
    var measurementId = req.params.id;
    var measurements = user.measurements;
    measurements.splice(measurementId, 1);
    user.measurements = measurements;
    var email = req.user.email ? req.user.email : {};
    var contacts = req.user.contacts;
    user.save();

    res.redirect(req.get('referer'));

    //res.render('user/profile', {csrfToken: req.csrfToken(), email: email, measurements: measurements, contacts: contacts, messages: messages, hasErrors: messages.length > 0});
});

router.get('/addContact', Common.isLoggedIn, function(req, res, next){
    if (!req.user){
        return res.redirect('/signin');
    }

    res.render('user/addContact', {csrfToken: req.csrfToken()});
});

router.get('/removeContact/:id', Common.isLoggedIn, function(req, res, next) {
    var messages = req.flash('error');
    var user = User(req.user);
    if (!req.user){
        return res.redirect('/signin');
    }
    var contactId = req.params.id;
    var contacts = user.contacts;
    contacts.splice(contactId, 1);
    user.contacts = contacts;
    var email = req.user.email ? req.user.email : {};
    var measurements = req.user.measurements;
    user.save();

    res.redirect(req.get('referer'));

    //res.render('user/profile', {csrfToken: req.csrfToken(), email: email, measurements: measurements, contacts: contacts, messages: messages, hasErrors: messages.length > 0});
});

router.post('/addContact', Common.isLoggedIn, function(req, res, next){
    var messages = req.flash('error');
    var user = User(req.user);
    if (!req.user){
        return res.redirect('/signin');
    }

    var newContact = {
        description: req.body.Desc,
        firstName: req.body.FName,
        lastName: req.body.LName,
        address: req.body.Address,
        country: req.body.Country,
        city: req.body.City,
        state: req.body.State,
        zipcode: req.body.Zipcode,
        phone: req.body.Phone
    };

    user.contacts.push(newContact);

    var email = req.user.email ? req.user.email : {};
    var measurements = req.user.measurements;
    var contacts = user.contacts;
    user.save();

    res.redirect('/user/profile');

    //res.render('user/profile', {csrfToken: req.csrfToken(), email: email, measurements: measurements, contacts: contacts, messages: messages, hasErrors: messages.length > 0});
});

router.get('/logout', Common.isLoggedIn, function(req, res, next){
    req.logout();
    res.redirect('/');
});

//other routes are for not logged in
router.use('/', Common.notLoggedIn, function(req, res, next){
   next();
});

router.get('/signup', function(req, res, next) {
    var messages = req.flash('error');
    res.render('user/signup', {csrfToken: req.csrfToken(), messages: messages, hasErrors: messages.length > 0})
});

router.post('/signup', passport.authenticate('local.signup', {
    failureRedirect: '/user/signup',
    failureFlash: true
}), function(req, res, next) {
    if (req.session.oldUrl) {
        var url = req.session.oldUrl;
        req.session.oldUrl = null;
        res.redirect(url);
    } else {
        res.redirect('/user/profile')
    }
});

router.get('/signin', function(req, res, next){
    var messages = req.flash('error');
    res.render('user/signin', {csrfToken: req.csrfToken(), messages: messages, hasErrors: messages.length > 0})
});

router.post('/signin', passport.authenticate('local.signin', {
    failureRedirect: '/user/signin',
    failureFlash: true
}), function(req, res, next) {
    if (req.session.oldUrl) {
        var url = req.session.oldUrl;
        req.session.oldUrl = null;
        res.redirect(url);
    } else {
        res.redirect('/user/profile')
    }
});

router.get('/reset/:token', Common.notLoggedIn, function(req, res) {
    var messages = req.flash();
    User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
        if (!user) {
            req.flash('error', 'Password reset token is invalid or has expired.');
            return res.redirect('user/forgot');
        }
        res.render('user/reset', {
            csrfToken: req.csrfToken(),
            user: req.user,
            messages: messages, hasErrors: messages.length > 0
        });
    });
});

router.post('/reset/:token', Common.notLoggedIn, function(req, res) {
    var messages = req.flash();
    async.waterfall([
        function(done) {
            User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
                if (!user) {
                    req.flash('error', 'Password reset token is invalid or has expired.');
                    return res.redirect('back');
                }

                //TODO: should this be a passport profile or does it not matter?
                user.password = user.encryptPassword(req.body.password);
                user.resetPasswordToken = undefined;
                user.resetPasswordExpires = undefined;

                user.save(function(err) {
                    req.logIn(user, function(err) {
                        done(err, user);
                    });
                });
            });
        },
        function(user, done) {
            var transport = nodemailer.createTransport(smtpTransport({
                //TODO: configure with the smtp server wayne makes
                host: 'some-smtp-host.com',
                port: 465,
                secure: true,
                auth: {
                    user: 'username',
                    pass: 'password'
                },
                logger: true
            }));
            var mailOptions = {
                to: user.email,
                from: 'support@ledavin.com',
                subject: 'Your password has been changed',
                text: 'Hello,\n\n' +
                'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n\n' +
                'If you did not make these changes then please visit http://' + req.headers.host + '/user/forgot to reset your' +
                ' password as soon as possible. As a precaution, we also recommend also changing your email password ' +
                'as well if your LeDaVin password has unexpectedly changed\n\n' +
                'Best,\n LeDaVin Support Team'
            };
            transport.sendMail(mailOptions, function(err) {
                req.flash('success', 'Success! Your password has been changed.');
                done(err);
            });
        }
    ], function(err) {
        res.render('/', {csrfToken: req.csrfToken(), messages: messages, hasErrors: messages.length > 0});
    });
});

router.get('/forgot', Common.notLoggedIn, function(req, res) {
    res.render('user/forgot', {csrfToken: req.csrfToken(), user: req.user});
});

router.post('/forgot', Common.notLoggedIn, function(req, res, next) {
    var messages = req.flash();
    async.waterfall([
        function(done) {
            crypto.randomBytes(20, function(err, buf) {
                var token = buf.toString('hex');
                done(err, token);
            });
        },
        function(token, done) {
            User.findOne({ email: req.body.email }, function(err, user) {
                if (!user) {
                    req.flash('error', 'No account with that email address exists!');
                    return res.render('user/forgot', {csrfToken: req.csrfToken(), messages: messages, hasErrors: messages.length > 0});
                }

                user.resetPasswordToken = token;
                user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

                user.save(function(err) {
                    done(err, token, user);
                });
            });
        },
        function(token, user, done) {
            var transport = nodemailer.createTransport(smtpTransport({
                //TODO: configure with the smtp server wayne makes
                host: 'some-smtp-host.com',
                port: 465,
                secure: true,
                auth: {
                    user: 'username',
                    pass: 'password'
                },
                logger: true
            }));
            var mailOptions = {
                to: user.email,
                from: 'support@ledavin.com',
                subject: 'LeDaVin Password Reset',
                text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                'http://' + req.headers.host + '/user/reset/' + token + '\n\n' +
                'If you did not request this, please ignore this email and your password will remain unchanged.\n'
            };
            transport.sendMail(mailOptions, function(err) {
                req.flash('info', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
                done(err, 'done');
            });
        }
    ], function(err) {
        if (err) return next(err);
        res.render('user/forgot', {csrfToken: req.csrfToken(), messages: messages, hasErrors: messages.length > 0});
    });
});

module.exports = router;



