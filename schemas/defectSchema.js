var restful = require('node-restful');
var mongoose = restful.mongoose;
uri  = 'mongodb://mdbuser:mdbpassword@ds031978.mongolab.com:31978/restapi';
local = 'mongodb://localhost/restapi';
mongoose.connect(uri);
//To render home page

var DefectSchema =  new mongoose.Schema({
    section: String,
    cr: String,
    desc: String,
    steps: Array,
    severity: String,
    status: String,
    env: String,
    developer: String,
    devComment: String,
    screenshots: String,
    date: String,
    loggedBy : String
},{collection :"defects"});
// var db = require('mongodb').Db;

// db.collection('defects',function(err,docs){
// db.dropDatabase();
// }); 
  
  

var Defect = restful.model('Defect',DefectSchema);
// Defect.createIndex( { defectId: 1 }, { unique: true } )
module.exports = Defect;