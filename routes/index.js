//Dependencies
var express = require('express');
var router = express.Router();
var sendgrid = require('sendgrid')('KarthikDev','Sendgrid@2015');
//var json = require('../users.json');
var User = require('../schemas/userSchema');
var session = require('client-sessions');
var bcrypt = require('bcryptjs');


router.use(session({
	cookieName:'session',
	secret :'qwdh87d723d7823dg823dg283dg23d9283d',
	duration : 30 * 60 * 1000,
	activeDuration : 5 * 60 *1000,
	ephemeral :true
}));
var async = require('async');

//  User.find(function(err,docs){
// console.log(docs.emai);
//  });
// var db = require('mongodb').Db;

// var myIds = new Array();
//  db.users.find().forEach(function(myDoc){
//  		myIds.push(myDoc.email);
//  	});
//  console.log(myIds);
// var userlist = json.userList.users;
// for(i=0;i<userlist.length;i++){
//     var targetModel = userlist[i];
// 	//	var hash = bcrypt.hashSync(targetModel.soeid,bcrypt.genSaltSync(10));
// 		var user = new User({  
//         name: targetModel.name,
//     	soeid: targetModel.soeid,
//     	 email: targetModel.email,
//     	auth_token: targetModel.auth_token,
//     	id:""

// 	});
// user.save();
// }
// console.log(json);



// router.get('/', function(req, res, next) {
//   res.render('addDefect',{'staticData':json});
// });

// router.get('/', function(req, res, next) {
//   res.render('index');
// });


//LOGIN 
// var User = require('../schemas/userSchema');
// var user = new User();
// var Defect = require('../schemas/defectSchema');
// router.post('/defects',function(req,res){
// //if(logginuser is valied user)
// Defect.find(function(err,data){
// 	res.render('defects', { title: 'DefectList',defectsList:data,user:req.body.username,staticData:json});
//   });
// });


<!-- LOGIN AUTHENTICATION -->


router.post("/login", function(req, res){
	console.log("LOGIN FUNCTION");
	User.findOne({'soeid':req.body.username}, function(err, user){
        if(user){
			 // Compare the POSTed password with the encrypted db password
			
           // if(bcrypt.compareSync(req.body.username,user.soeid)){
              //  res.cookie('user_id', user.id, { signed: true, maxAge: config.cookieMaxAge  });
             //   res.cookie('auth_token', user.auth_token, { signed: true, maxAge: config.cookieMaxAge  });
				req.session.user = user;
				checkSessionData(req,res);
				// Correct credentials, return the user object
              //  res.json({ user: _.omit(user, ['password', 'auth_token']) });  
             // } 
           //   else{
            //  	 res.json({ error: "Authentication Failed By a nick" }); 
           //   }
        } else {
            // Could not find the username
            res.json({ error: "Authentication Failed" });   
        }
    });
});


function checkSessionData(req,res){

if(req.session && req.session.user){
	    User.findOne({'name':req.session.user.name}, function(err, user){
if(!user){
	req.session.reset();
	res.json({error : "Session expired"});
}
else{
	res.locals.user = user;
	res.json({success : "Session Exists ! Great !",user:user});	
}
});
}
else{
	res.json({error : "Please login.No session cookie found"});
}
}




<!--GET DEFECTS -->

var Defect = require('../schemas/defectSchema');
router.get('/defects', function(req, res, next) { 
  Defect.find(function(err,docs){
  	// res.header("Access-Control-Allow-Origin", "*");
  //	console.log(docs);
	res.send(docs);

    // docs.forEach(function(item){
    //   console.log("Received successfully !!" + item._id);

    //   //res.render('defects', { title: 'DefectList',defectsList:docs});
    // })

     // collection.find().toArray(function(err, items) {
     //        res.send(items);
     //    });
     // res.render('defects', { title: 'DefectList',defectsList:data,user:admin,staticData:json});
  }).sort({$natural:-1});
});



// async.series([ function(callback) {

//fixed,retest,not ale to reproduce -- developer to tester
//reopened -- tester to developer


			// 		// var data = "";
			// 		// var mailStatus = ['Fixed','Not able to reproduce','Reopened','Retest'];
			// 		// console.log(req.params);
			// 		// 	console.log("INSIDE");
			// 		// 	      var query = User.findOne({_id:req.params.id});
			// 		//         query.exec(function(err, user) {
			// 		//             if (err) {
			// 		//                 callback(err);
			// 		//            }
			// 		//            if(mailStatus.indexOf(user.status) > -1){
			// 		//  			 data = retrieveEmail(user);
			// 		//  			}
			// 		//         });
			// 		//         callback(false, data);
			// 		}],
				    // function(err, results) {
				     //  res.send({defectId:req.params.id});
				    // });

<!--UDPATE DEFECT -->
router.put('/defects/:id',function(req,res){
	console.log('received update request');
	//var defect = new Defect(req.body);
	Defect.update({_id:req.params.id},req.body,
		function(err){
			res.send({_id:req.params.id });
		});
});


<!-- GET MAIL IDS -->

	function retrieveEmail(doc){
		var mailSent = "";
			console.log("RETRIEVE MAIL");
		async.parallel([
		 
		    //Read sheets data from Sheets
		    function(callback) {
		        var query = User.findOne({'name':doc.loggedBy});
		        query.exec(function(err, user) {
		            if (err) {
		                callback(err);
		            }
		 			console.log(user.email);
		            callback(null, user.email);
		        });
		    },
		 
		    //Read friends data from Friends
		    function(callback) {
		  		var query = User.findOne({'name':doc.developer});
		      		 query.exec(function(err, user) {
		            if (err) {
		                callback(err);
		            }
		        	console.log(user);
		            callback(null, user.email);
		        });
		    },
		],
		 
		//Compute all results
		function(err, results) {
		    if (err) {
		        console.log(err);
		        return res.send(400);
		    }
		 
		    if (results == null || results[0] == null) {
		        return res.send(400);
		    }
		 console.log("RETRIEVE MAIL CALLBACK");
		 return sendEmail(results[0],results[1],doc);
		});
}


<!-- SEND MAIL -->

function sendEmail(from,to,doc){

	console.log("SENDING MAIL...");
	console.log(from);
	console.log(to);
	console.log(doc);

	var sendEmail = false;

	var emailDetails = new sendgrid.Email({
		to: "",
		from: from,
		subject: 'Defect Logger - '+ doc.cr + ' - '+ doc.desc ,
		html: '<div>Hey ' +doc.developer + ' !</div> \n <div> A defect has been logged in your name : </div>\n'+
		'<div><span style="font-weight:bold;">Section : </span>' + doc.section + '</div>\n'+
		'<div><span style="font-weight:bold;">CR : </span>' + doc.cr + '</div>\n'+
		'<div><span style="font-weight:bold;">Description : </span>' + doc.desc + '</div>\n'+
		'<div><span style="font-weight:bold;">Severity : </span>' + doc.severity + '</div>\n'+
		'<div><span style="font-weight:bold;">Environment : </span>' + doc.env + '</div>\n'+
		'\n'+
		'<div>Acknowledge the defect by moving the status to AIP/WIP in http://www.cpb-dl.herokuapp.com</div>\n'
		'<div>-------------------DEFECT LOGGER IS BEING TESTED - PLEASE BARE WITH US-------------------</div>\n'
	});
    // Adding separately to include an array of email Id's
	emailDetails.addTo(to);
console.log("------EMAIL DETAILS---------");
console.log(emailDetails);

	sendgrid.send(emailDetails,function(err,json){
			if(err){
				console.log("SENDING MAIL ERROR : ");
				return console.error(err);
			}else{
				sendEmail = true;
				console.log("MAIL SENT SUCCESSFULLY");
				return json;
			}
				
		});

}




<!--SAVE DEFECT -->

router.post('/defects',function(req,res){
	var newDefect = new Defect(req.body);
	console.log('---POST REQUEST RECEIVED---');
	console.log(req.body);
	newDefect.date = getDate();
	newDefect.developer =  req.body.developer;
	newDefect.section =  req.body.section;
	newDefect.cr =  req.body.cr;
	newDefect.desc =  req.body.desc;
	newDefect.steps =  req.body.steps;
	newDefect.env =  req.body.env;
	newDefect.status =  req.body.status;
	newDefect.severity =  req.body.severity;
	newDefect.loggedBy =  req.body.loggedBy;
		newDefect.save(function(err,doc){
			if(err){
				console.log(err);
				res.json(err);
			}
			else{
				async.series([ function(callback) {
					var data = retrieveEmail(doc);
					// data.isAuthorized is set by the service being invoked
                    callback(false, data);
                
				    } ],
				    function(err, results) {
				        console.log(results);
				        // correctly gets invoked after async call completes
				        // but res.json isn't sending anything to the client
				   		res.json(doc);	
				    	
				        
				    });
			}
		}); 
	});


<!-- LOG OUT -->

router.post("/logout", function(req, res){
	req.session.reset();
	res.json({msg:"Logged out successfully !"});
});


function getDate(){
var today = new Date();
var dd = today.getDate();
var mm = today.getMonth()+1; //January is 0!
var yyyy = today.getFullYear();
if(dd<10) {
    dd='0'+dd
} 
if(mm<10) {
    mm='0'+mm
} 
today = mm+'/'+dd+'/'+yyyy;
return today;
}

// var routes = require('./defects');
// router.use('/defects', routes);

module.exports = router;