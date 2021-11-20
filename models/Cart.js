const mongoose = require('mongoose');

const cartsSchema = mongoose.Schema({
    _id : { type : String , require : true } ,
    totalQuantity : { type : Number , require : true } ,
    totalPrice : { type : Number , require : true } ,
    selectedProducts : { require : true , type : Array }
});

module.exports = mongoose.model( 'Cart' , cartsSchema );