requirejs.config({
baseUrl :'./js',
paths :{

	'jquery' : 'libs/jquery-1.11.3.min',
	'underscore':'libs/underscore-min',
	'backbone' :'libs/backbone-min',
	'text' :'libs/text',
  'iscroll' :'libs/iscroll',
	'table2excel' :'libs/jquery.table2excel',
  'router' :'router',
	'model_defect' : 'models/defect', 
  'collection_defects' : 'collections/defects', 
  'model_session' : 'models/session', 
  'model_user' : 'models/user', 
  'view_defect': 'views/defects', 
	'view_logDefect': 'views/logDefect'  ,
  'view_help': 'views/help'  ,
   'view_login': 'views/login'  

},

shim: {
       
        underscore: {
            exports: "_"
        },
        backbone: {
            deps: ["underscore", "jquery"],
            exports: "Backbone"
        }
    }

});


require(
  ["jquery","underscore","backbone","view_login"],

  function($, _, B, LoginView) {
    $(function() {
      $('body').append('<section class="login"></section>');
      new LoginView({});
    });
});