var restful = require('node-restful');
var mongoose = restful.mongoose;
//mongoose.connect('mongodb://localhost/restapi');
//To render home page
var UserSchema =  new mongoose.Schema({

      soeid:  String,
    name :String,
    email: Array,
    auth_token : String,
    id : String
},{collection :"users"});

var User = restful.model('User',UserSchema);
// Defect.createIndex( { defectId: 1 }, { unique: true } )
module.exports = User;