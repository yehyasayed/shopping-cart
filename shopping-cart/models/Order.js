const mongoose = require('mongoose');
const schema = mongoose.Schema;

const orderSchema = mongoose.Schema({
    user : {
        type : schema.Types.ObjectId ,
        ref : 'User' ,
        require : true
    } ,
    cart : {
        type : Object ,
        require :true 
    } ,
    address : {
        type : String ,
        require :true
    } ,
    name : {
        type : String ,
        require :true
    } ,
    paymentId : {
        type : String ,
        require :true
    } , 
    orderPrice : {
        type : String , 
        require :true
    }
});

module.exports = mongoose.model( 'Order' , orderSchema );