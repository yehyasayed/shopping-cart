var express = require('express');
var router = express.Router();
const Product = require('../models/products');
const Cart = require('../models/Cart');
const Order = require('../models/Order');
const { check, validationResult } = require('express-validator');
const csrf = require('csurf');
router.use(csrf());
const userControl = require('../controllers/user_control');

// home  page ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

router.get('/', userControl.getProducts );

// get user cart ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

router.get('/user-cart', isSignin, userControl.getUserCart);

// add product to cart ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

router.get('/addToCart/:id', isSignin, userControl.addProductToCart);

// increase Product ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

router.get('/increase-product/:index', isSignin, userControl.increaseProduct);

// decrease Product ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

router.get('/decrease-product/:index', isSignin, userControl.decreaseProduct);

// checkout ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

router.get('/checkout', isSignin, userControl.checkout);

router.post('/checkout/finsh-checkout', [
  check('name').not().isEmpty().withMessage('Name Required'),
  check('address').not().isEmpty().withMessage('Address Required'),
  check('creditNumber').not().isEmpty().withMessage('Credit Number Required'),
  check('cvc').not().isEmpty().withMessage('CVC Required'),
  check('expirationMonth').not().isEmpty().withMessage('Expiration Month Required'),
  check('expirationYear').not().isEmpty().withMessage('Expiration Year Required'),
], isSignin, userControl.checkOut);

// Check Is Authenticated or not ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

function isSignin(req, res, next) {
  if (!req.isAuthenticated()) {
    res.redirect('/users/signin');
    return;
  } else {
    next();
  }
}

module.exports = router;
