const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    imagePath : { type : String , require : true } ,
    productName : { type : String , require : true } ,
    productPrice : { type : Number , require : true } ,
    productInformation : {
        require : true ,
        type : {
            storageCapacity : Number ,
            NumberOfHIM : String ,
            cameraResolution : Number ,
            displaySize : Number ,
        } ,
    } ,
});

module.exports = mongoose.model( 'Product' , productSchema );