const Product = require('../models/products');
const Cart = require('../models/Cart');
const Order = require('../models/Order');
const User = require('../models/user');
const { check, validationResult } = require('express-validator');
const fs = require('fs');

// products ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

exports.getProducts = (req, res, next) => {
  Product.count().then(function (count) {
    const pageNumber = Number.parseInt(req.query.page);
    const sizeNumber = Number.parseInt(req.query.size);

    let size = 6;
    if (!Number.isNaN(sizeNumber) && sizeNumber > 0 && sizeNumber < 6) {
      size = sizeNumber;
    }

    let page = 0;
    if (!Number.isNaN(pageNumber) && pageNumber > 0 && pageNumber <= Math.ceil(count / size)) {
      page = pageNumber;
    }

    Product.find({}).limit(size).skip(page * size).then(function (pro) {
      var totalQuantity = null;
      if (req.isAuthenticated()) {
        totalQuantity = req.user.cart.totalQuantity;
      }

      var pages = [page, Math.ceil(count / size), ''];

      res.render('index', { pages: pages, products: pro, admin: isAdmin(req), checkAuth: req.isAuthenticated(), totalQuantity: totalQuantity });
    });
  });
}

// add product to card ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

exports.addProductToCart = (req, res, next) => {
  const userId = req.user.id;
  var cart = req.user.cart;
  Product.findById(req.params.id, 'productName productPrice', (error, selectedProduct) => {
    var productIndex = -1;
    var selectedProductId = JSON.stringify(selectedProduct._id);
    for (var i = 0; i < cart.selectedProducts.length; i++) {
      if (cart.selectedProducts[i]._id == selectedProductId) {
        productIndex = i;
        break;
      }
    }
    if (productIndex < 0) {
      cart.totalPrice += selectedProduct.productPrice;
      cart.totalQuantity++;
      cart.selectedProducts.push({
        _id: JSON.stringify(selectedProduct._id),
        productName: selectedProduct.productName,
        productPrice: selectedProduct.productPrice,
        productQuantity: 1
      });
      Cart.updateOne({ _id: userId }, { $set: cart }, (er, re) => { res.redirect('/'); });
    } else {
      cart.totalPrice += selectedProduct.productPrice;
      cart.totalQuantity++;
      cart.selectedProducts[productIndex].productQuantity++;
      Cart.updateOne({ _id: userId }, { $set: cart }, (er, re) => { res.redirect('/'); });
    }
  });
}

// get user cart ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

exports.getUserCart = (req, res, next) => {
  var userCart = req.user.cart;
  res.render('user-cart', { cart: userCart, admin: isAdmin(req), checkAuth: req.isAuthenticated(), totalQuantity: userCart.totalQuantity })
}

// increase Product ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

exports.increaseProduct = (req, res, next) => {
  const userId = req.user.id;
  const index = req.params.index;
  var cart = req.user.cart;
  if (index >= 0 && index < cart.selectedProducts.length) {
    cart.totalQuantity++;
    cart.totalPrice += cart.selectedProducts[index].productPrice;
    cart.selectedProducts[index].productQuantity++;
    Cart.updateOne({ _id: userId }, { $set: cart }, (error, result) => {
      res.redirect('/user-cart');
    });
  } else {
    res.redirect('/');
  }
}

// decrease Product ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

exports.decreaseProduct = (req, res, next) => {
  const userId = req.user.id;
  const index = req.params.index;
  var cart = req.user.cart;
  if (index >= 0 && index < cart.selectedProducts.length) {
    if (cart.selectedProducts[index].productQuantity == 1) {
      cart.totalQuantity--;
      cart.totalPrice -= cart.selectedProducts[index].productPrice;
      cart.selectedProducts.splice(index, 1);
      Cart.updateOne({ _id: userId }, { $set: cart }, (error, result) => {
        res.redirect('/user-cart');
      });
    } else {
      cart.totalQuantity--;
      cart.totalPrice -= cart.selectedProducts[index].productPrice;
      cart.selectedProducts[index].productQuantity--;
      Cart.updateOne({ _id: userId }, { $set: cart }, (error, result) => {
        res.redirect('/user-cart');
      });
    }
  } else {
    res.redirect('/');
  }
}

// checkout ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

exports.checkout = (req, res, next) => {
  var totalPrice = req.user.cart.totalPrice;
  var totalQuantity = null;
  if (req.isAuthenticated()) {
    totalQuantity = req.user.cart.totalQuantity;
  }
  const errorMassages = req.flash('checkoutError');
  res.render('checkout', { massages: errorMassages, admin: isAdmin(req), checkoutPrice: totalPrice, checkAuth: req.isAuthenticated(), totalQuantity: totalQuantity, token: req.csrfToken });
}
exports.checkOut = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    var validationMassages = [];
    for (var i = 0; i < errors.errors.length; i++) {
      validationMassages.push(errors.errors[i].msg);
    }
    req.flash('checkoutError', validationMassages);
    res.redirect('/checkout');
  } else {
    const newOrder = new Order({
      user: req.user._id,
      cart: req.user.cart,
      address: req.body.address,
      name: req.body.name,
      orderPrice: req.user.cart.totalPrice,
    });
    newOrder.save((error, result) => {
      var cart = req.user.cart;
      cart.totalPrice = 0;
      cart.totalQuantity = 0;
      cart.selectedProducts = [];
      Cart.updateOne({ _id: req.user._id }, { $set: cart }, (err, re) => {
        res.redirect('/');
      });
    });
  }
}

// sign up ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

exports.signup = (req, res, next) => {
  const errorMassages = req.flash('signupError');
  res.render('user/signup', { massages: errorMassages, admin: false, checkAuth: false, token: req.csrfToken });
}
exports.signUp = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    var validationMassages = [];
    for (var i = 0; i < errors.errors.length; i++) {
      validationMassages.push(errors.errors[i].msg);
    }
    req.flash('signupError', validationMassages);
    res.redirect('/users/signup');
  } else {
    next();
  }
}

// profile ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

exports.userProfile = (req, res, next) => {
  var totalQuantity = null;
  if (req.isAuthenticated()) {
    totalQuantity = req.user.cart.totalQuantity;
  }
  const user = req.user;
  var tf = false;
  const errorMassages = req.flash('updateError');
  if (errorMassages.length > 0) {
    tf = true;
  }
  console.log(req.user.image);
  Order.find({ user: req.user._id }, (error, result) => {
    res.render('user/profile', { image: req.user.image, admin: req.user.isAdmin(), tf: tf, user: user, massages: errorMassages, orders: result, checkAuth: true, totalQuantity: totalQuantity, token: req.csrfToken });
  });
}

// change profile image ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

exports.changeProfileImage = (req, res, next) => {
  var img = './public/' + req.user.image;
  if (fs.existsSync(img)) {
    fs.unlink(img, (error) => {
      if (error) {
      } else {
        const newUser = { image: (req.file.path).slice(6) }
        User.updateOne({ _id: req.user._id }, { $set: newUser }, () => {
          res.redirect('/users/profile');
        });
      }
    });
  } else {
    const newUser = { image: (req.file.path).slice(6) }
    User.updateOne({ _id: req.user._id }, { $set: newUser }, () => {
      res.redirect('/users/profile');
    });
  }
}

// update user information ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

exports.updateUserInformation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    var validationMassages = [];
    for (var i = 0; i < errors.errors.length; i++) {
      validationMassages.push(errors.errors[i].msg);
    }
    req.flash('updateError', validationMassages);
    res.redirect('/users/profile');
  } else {
    User.findOne({ _id: req.user._id }, (error, user) => {
      if (!user.comparePassword(req.body.oldPassword)) {
        req.flash('updateError', 'the old password is incorrect');
        res.redirect('/users/profile');
      } else {
        const updateUser = {
          name: req.body.name,
          address: req.body.address,
          phone: req.body.phone,
          email: req.body.email,
          password: new User().hashPassword(req.body.password),
        };
        User.updateOne({ _id: req.user._id }, { $set: updateUser }, (err, re) => {
          res.redirect('/users/profile');
        });
      }
    });
  }
}

// sign In ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

exports.signin = (req, res, next) => {
  const errorMassages = req.flash('signinError');
  res.render('user/signin', { massages: errorMassages, admin: false, checkAuth: false, token: req.csrfToken });
}
exports.signIn = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    var validationMassages = [];
    for (var i = 0; i < errors.errors.length; i++) {
      validationMassages.push(errors.errors[i].msg);
    }
    req.flash('signinError', validationMassages);
    res.redirect('/users/signin');
  }
  else {
    next();
  }
}

// log out ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

exports.logout = (req, res, next) => {
  req.logOut();
  res.redirect('signin');
}

// Check Is Admin Or Not ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

function isAdmin(req) {
  return (req.isAuthenticated() && req.user.isAdmin());
}