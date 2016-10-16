var passport = require('passport');
var User = require('../models/user');
var LocalStrategy = require('passport-local').Strategy;

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done){
   User.findById(id, function(err, user) {
       done(err, user);
   });
});

passport.use('local.signup', new LocalStrategy({
    usernameField: 'email',
    password: 'password',
    passReqToCallback: true
}, function(req, email, password, done) {

    //validate form fields
    req.checkBody('email', 'Invalid email').notEmpty().isEmail();
    req.checkBody('password', 'Invalid password').notEmpty().isLength({min:8});

    //check for errors
    var errors = req.validationErrors();
    if (errors) {
        var messages = [];
        errors.forEach(function (error) {
            messages.push(error.msg);
        });
        return done(null, false, req.flash('error', messages));
    }

    User.findOne({'email': email}, function(err, user) {
        if (err) {
            return done(err);
        }
        if (user) {
            return done(null, false, {message: 'Email is already in use!'});
        }
        var newUser = new User();
        newUser.email = email;
        newUser.password = newUser.encryptPassword(password);
        newUser.save(function(err, result) {
           if (err){
               return done(err);
           }
            return done(null, newUser);
        });
    })
}));

//TODO: probably delete this if the password works on the user route
passport.use('local.update', new LocalStrategy({
    password: 'password',
    passReqToCallback: true
}, function(req, password, done) {

    //validate form fields
    req.checkBody('password', 'Invalid password').notEmpty().isLength({min:8});
    //req.checkBody('confirm', 'Invalid password').notEmpty().isLength({min:8});
    //todo: verify the passwords match in password and confirm fields

    //check for errors
    var errors = req.validationErrors();
    if (errors) {
        var messages = [];
        errors.forEach(function (error) {
            messages.push(error.msg);
        });
        return done(null, false, req.flash('error', messages));
    }

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

    User.findOne({'email': email}, function(err, user) {
        if (err) {
            return done(err);
        }
        if (user) {
            return done(null, false, {message: 'Email is already in use!'});
        }
        var newUser = new User();
        newUser.email = email;
        newUser.password = newUser.encryptPassword(password);
        newUser.save(function(err, result) {
            if (err){
                return done(err);
            }
            return done(null, newUser);
        });
    })
}));

passport.use('local.signin', new LocalStrategy({
    usernameField: 'email',
    password: 'password',
    passReqToCallback: true
}, function (req, email, password, done){
    //validate form fields
    req.checkBody('email', 'Invalid email').notEmpty().isEmail();
    req.checkBody('password', 'Invalid password').notEmpty();

    //check for errors
    var errors = req.validationErrors();
    if (errors) {
        var messages = [];
        errors.forEach(function (error) {
            messages.push(error.msg);
        });
        return done(null, false, req.flash('error', messages));
    }

    //find the user
    User.findOne({'email': email}, function(err, user) {
        if (err) {
            return done(err);
        }
        if (!user) {
            return done(null, false, {message: 'No user found!'});
        }
        if (!user.validPassword(password)){
            return done(null, false, {message: 'Incorrect password!'});
        }
        return done(null, user);
    })
}));
