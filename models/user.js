const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = mongoose.Schema({
    name : { type : String } ,
    address : { type : String } ,
    phone : { type : String } ,
    image : { type : String  , default : 'https://w7.pngwing.com/pngs/348/529/png-transparent-avatar-drawing-character-brazzer-child-hat-boy.png'} ,
    email : { type : String , require : true } ,
    password : { type : String , require : true } ,
    role : { type : String , default : 'user'} ,
});
userSchema.methods.hashPassword = function(password){ return bcrypt.hashSync( password , bcrypt.genSaltSync(5) , null ); }
userSchema.methods.comparePassword = function ( password ) { return bcrypt.compareSync( password , this.password ); }
// check user type user or admin
userSchema.methods.isAdmin = function(){ return ( this.role == 'admin' || this.email ==='admin@admin.com' ); }
module.exports = mongoose.model( 'User' , userSchema );