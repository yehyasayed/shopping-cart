const Product = require('../models/products');
const User = require('../models/user');
const { check, validationResult } = require('express-validator');

// get all Products ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

exports.getAllProducts = (req, res, next) => {
    Product.find({}, (error, resault) => {
        var totalQuantity = null;
        if (req.isAuthenticated()) {
            totalQuantity = req.user.cart.totalQuantity;
        }
        res.render('admin/products', { products: resault, admin: true, checkAuth: req.isAuthenticated(), totalQuantity: totalQuantity });
    });
}

// add Product ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

exports.addProduct = (req, res, next) => {
    const errorMassages = req.flash('addProductError');
    var totalQuantity = null;
    if (req.isAuthenticated()) {
        totalQuantity = req.user.cart.totalQuantity;
    }
    res.render('admin/add-product', { massages: errorMassages, admin: true, checkAuth: true, token: req.csrfToken, totalQuantity: totalQuantity })
}
exports.endAddProduct = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        var validationMassages = [];
        for (var i = 0; i < errors.errors.length; i++) {
            validationMassages.push(errors.errors[i].msg);
        }
        req.flash('addProductError', validationMassages);
        res.redirect('/users/add-product');
    }
    else {
        const product = new Product({
            imagePath: (req.file.path).slice(6),
            productName: req.body.name,
            productPrice: req.body.price,
            productInformation: {
                storageCapacity: req.body.psc,
                NumberOfHIM: req.body.pnoh,
                cameraResolution: req.body.pcr,
                displaySize: req.body.pds,
            },
        });
        product.save((err, re) => {
            console.log(re);
            res.redirect('/users/products');
        });
    }
}

// update Product ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

exports.updateProduct = (req, res, next) => {
    var totalQuantity = null;
    if (req.isAuthenticated()) {
        totalQuantity = req.user.cart.totalQuantity;
    }
    const errorMassages = req.flash('updateProductError');
    Product.findById({ _id: req.params.id }, (error, product) => {
        res.render('admin/update-product', { product: product, admin: true, massages: errorMassages, checkAuth: true, token: req.csrfToken, totalQuantity: totalQuantity })
    });
}
exports.endUpdateProduct = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        var validationMassages = [];
        for (var i = 0; i < errors.errors.length; i++) {
            validationMassages.push(errors.errors[i].msg);
        }
        req.flash('updateProductError', validationMassages);
        res.redirect('/users/update-product/' + req.params.id);
    }
    else {
        const product = {
            productName: req.body.name,
            productPrice: req.body.price,
            productInformation: {
                storageCapacity: req.body.psc,
                NumberOfHIM: req.body.pnoh,
                cameraResolution: req.body.pcr,
                displaySize: req.body.pds,
            },
        };
        Product.updateOne({ _id: req.params.id }, { $set: product }, (err, up) => {
            res.redirect('/users/products');
        });
    }
}

// delete Product ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

exports.deleteProduct = (req, res, next) => {
    Product.deleteOne({ _id: req.params.id }, (err, re) => {
        res.redirect('/users/products');
    })
}

// get all user ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

exports.getAllUser = (req, res, next) => {
    User.find({}, (error, resault) => {
        var totalQuantity = null;
        if (req.isAuthenticated()) {
            totalQuantity = req.user.cart.totalQuantity;
        }
        res.render('admin/users', { users: resault, admin: true, checkAuth: req.isAuthenticated(), totalQuantity: totalQuantity });
    });
}

// delete user ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

exports.deleteUser = (req, res, next) => {
    User.deleteOne({ _id: req.params.id }, (err, re) => {
        res.redirect('/users/users');
    })
}

// Add Admin ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

exports.addAdmin = (req, res, next) => {
    const errorMassages = req.flash('addAdminError');
    res.render('admin/add-admin', { massages: errorMassages, admin: true, checkAuth: true, token: req.csrfToken });
}
exports.endAddAdmin = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        var validationMassages = [];
        for (var i = 0; i < errors.errors.length; i++) {
            validationMassages.push(errors.errors[i].msg);
        }
        req.flash('addAdminError', validationMassages);
        res.redirect('/users/add-admin');
    } else {
        next();
    }
}