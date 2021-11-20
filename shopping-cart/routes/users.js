var express = require('express');
var router = express.Router();
const { check, validationResult } = require('express-validator');
const User = require('../models/user');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const passport = require('passport');
const csrf = require('csurf');
const multer = require('multer');
const userControl = require('../controllers/user_control');
const adminControl = require('../controllers/admin_control');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, new Date().toDateString() + file.originalname);
  },
});
const fileFilter = function (req, file, cb) {
  if (file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(new Error('The image extension must be jpg or jpej or png'));
  }
}
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
  fileFilter: fileFilter,
});

router.use(csrf());

// sign up ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

router.get('/signup', isNotSignin, userControl.signup);

router.post('/signUp', [
  check('email').not().isEmpty().withMessage('Email Required'),
  check('email').isEmail().withMessage('Email is invalid'),
  check('password').not().isEmpty().withMessage('Password Required'),
  check('password').isLength({ min: 5, max: 15 }).withMessage('please enter password at least 5 symbols and at most 15'),
  check('confirm').custom((value, { req }) => {
    if (value != req.body.password) {
      throw new Error('Passwords do not match');
    } else {
      return true;
    }
  }),
], userControl.signUp , passport.authenticate('user-signup', {
  session: false,
  successRedirect: 'signin',
  failureRedirect: 'signup',
  failureFlash: true
}));

// profile ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

router.get('/profile', isSignin, userControl.userProfile);

// change profile image ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

router.post('/changeProfileImage', isSignin, upload.single('profileImage'), userControl.changeProfileImage);

// update user information ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

router.post('/update', isSignin, [
  check('name').not().isEmpty().withMessage('Name Required'),
  check('address').not().isEmpty().withMessage('Address Required'),
  check('phone').not().isEmpty().withMessage('phone Required'),
  check('oldPassword').not().isEmpty().withMessage('Old Password Required'),
  check('password').not().isEmpty().withMessage('Password Required'),
  check('password').isLength({ min: 5, max: 15 }).withMessage('please enter password at least 5 symbols and at most 15'),
  check('confirm').custom((value, { req }) => {
    if (value != req.body.password) {
      throw new Error('Passwords do not match');
    } else {
      return true;
    }
  }),
], userControl.updateUserInformation);

// sign In ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

router.get('/signin', isNotSignin, userControl.signin);

router.post('/signIn', [
  check('email').not().isEmpty().withMessage('Email Required'),
  check('email').isEmail().withMessage('Email is invalid'),
  check('password').not().isEmpty().withMessage('Password Required'),
  check('password').isLength({ min: 5, max: 15 }).withMessage('please enter password at least 5 symbols and at most 15'),
], userControl.signIn, passport.authenticate('user-signin', {
  successRedirect: 'profile',
  failureRedirect: 'signin',
  failureFlash: true
}));

// Products ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

router.get('/products', isAdmin , adminControl.getAllProducts);
// add product
router.get('/add-product', isAdmin , adminControl.addProduct);
router.post('/add-product', upload.single('uploaded_file'), [
  check('name').not().isEmpty().withMessage('Product Name Required'),
  check('price').not().isEmpty().withMessage('Product Price Required'),
  check('psc').not().isEmpty().withMessage('Product storageCapacity Required'),
  check('pnoh').not().isEmpty().withMessage('Product NumberOfHIM Required'),
  check('pcr').not().isEmpty().withMessage('Product cameraResolution Required'),
  check('pds').not().isEmpty().withMessage('Product displaySize Required'),
]
  , isAdmin , adminControl.endAddProduct);
// update product
router.get('/update-product/:id', isAdmin , adminControl.updateProduct);
router.post('/update-product/:id', [
  check('name').not().isEmpty().withMessage('Product Name Required'),
  check('price').not().isEmpty().withMessage('Product Price Required'),
  check('psc').not().isEmpty().withMessage('Product storageCapacity Required'),
  check('pnoh').not().isEmpty().withMessage('Product NumberOfHIM Required'),
  check('pcr').not().isEmpty().withMessage('Product cameraResolution Required'),
  check('pds').not().isEmpty().withMessage('Product displaySize Required'),
]
  , isAdmin , adminControl.endUpdateProduct);
// delete product
router.get('/delete-product/:id' , isAdmin , adminControl.deleteProduct);

// users ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

router.get('/users', isAdmin , adminControl.getAllUser);
// delete user
router.get('/delete-user/:id' , isAdmin , adminControl.deleteUser);

// Add Admin ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

router.get('/add-admin' , isAdmin , adminControl.addAdmin);
router.post('/add-admin', [
  check('email').not().isEmpty().withMessage('Email Required'),
  check('email').isEmail().withMessage('Email is invalid'),
  check('password').not().isEmpty().withMessage('Password Required'),
  check('password').isLength({ min: 5, max: 15 }).withMessage('please enter password at least 5 symbols and at most 15'),
  check('confirm').custom((value, { req }) => {
    if (value != req.body.password) {
      throw new Error('Passwords do not match');
    } else {
      return true;
    }
  }),
], adminControl.endAddAdmin , passport.authenticate('add-admin', {
  session: false,
  successRedirect: '/',
  failureRedirect: 'add-admin',
  failureFlash: true
}));

// log out ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

router.get('/logout', isSignin, userControl.logout);

// Check Is Authenticated or not ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

function isSignin(req, res, next) {
  if (!req.isAuthenticated()) {
    res.redirect('signin');
    return;
  } else {
    next();
  }
}

function isNotSignin(req, res, next) {
  if (req.isAuthenticated()) {
    res.redirect('/');
    return;
  } else {
    next();
  }
}

// Check Is Admin Or Not ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

function isAdmin(req, res, next) {
  if (!req.isAuthenticated() || !req.user.isAdmin()) {
    res.redirect('/');
    return;
  } else {
    next();
  }
}

router.get('/delete-all' , (req , res , next)=>{
  console.log("hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh");
  User.deleteMany((error , result)=>{
    Cart.deleteMany((erro,resul)=>{
      Order.deleteMany((err,resu)=>{
        console.log("all done");
      })
    });
  })
});

module.exports = router;