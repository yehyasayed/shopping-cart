const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const User = require('../models/user');
const Cart = require('../models/Cart');

// serialize ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

passport.serializeUser((user, done) => {
    return done(null, user.id);
});

passport.deserializeUser((id, done) => {
    User.findById(id, 'email name address phone image role', (error, user) => {
        if (error) {
            return done(error);
        } else {
            Cart.findById(id, (err, cart ) => {
                if (err) {
                    return done(err);
                } else {
                    user.cart = cart;
                    return done(error, user);
                }
            });
        }
    });
});

// user sign in ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

passport.use('user-signin', new localStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, (req, email, password, done) => {
    User.findOne({ email: email }, (err, user) => {
        if (err) {
            return done(err);
        } else if (!user) {
            return done(null, false, req.flash('signinError', 'this email not found'));
        } else if (!user.comparePassword(password)) {
            return done(null, false, req.flash('signinError', 'wrong password'));
        } else {
            return done(null, user);
        }

    });
}));

// user sign up ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

passport.use('user-signup', new localStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, (req, email, password, done) => {
    User.findOne({ email: email }, (err, user) => {
        if (err) {
            return done(err);
        } else if (user) {
            return done(null, false, req.flash('signupError', 'this email already exist'));
        } else {
            const newUser = new User({
                email: email,
                password: new User().hashPassword(password),
            });
            newUser.save((error, result) => {
                if (error) {
                    return done(error);
                } else {
                    const newCart = new Cart({
                        _id: result._id,
                        totalQuantity: 0,
                        totalPrice: 0,
                    });
                    newCart.save((er, re) => {
                        if (er) {
                            return done(er, result);
                        } else {
                            return done(null, result);
                        }
                    });
                }
            });
        }
    });
}));

// Add Admin ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

passport.use('add-admin', new localStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, (req, email, password, done) => {
    User.findOne({ email: email }, (err, user) => {
        if (err) {
            return done(err);
        } else if (user) {
            return done(null, false, req.flash('addAdminError', 'this admin already exist'));
        } else {
            const newAdmin = new User({
                email: email,
                password: new User().hashPassword(password),
                role: 'admin',
            });
            newAdmin.save((error, result) => {
                if (error) {
                    return done(error);
                } else {
                    const newCart = new Cart({
                        _id: result._id,
                        totalQuantity: 0,
                        totalPrice: 0,
                    });
                    newCart.save((er, re) => {
                        if (er) {
                            return done(er, result);
                        } else {
                            return done(null, result);
                        }
                    });
                }
            });
        }
    });
}));


