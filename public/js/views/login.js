
var sandbox = sandbox || {};
sandbox.views ={};
define(['backbone','text!/templates/login.html','model_session',"view_defect"], 
    function(Backbone,loginTemplate) {
    sandbox.views.Login = Backbone.View.extend({
        el: '.login',
        
        initialize: function() {
            console.log("initializing login");
            // _.bindAll(this,'render');
            // do stuff on initialize
             // app.session.listenTo("change:logged_in", this.render);
             this.render();
        },


        render:function () {
           // if(app.session.get('logged_in')){
             
            //   new sandbox.views.DefectsView();

             sandbox.session  = new sandbox.models.Session();


             //  } 
            // else{
            //     $('#loaderOverlay,.loader').fadeOut();
               this.template =  _.template($(loginTemplate).html());
               this.$el.html(this.template());
               $('#loaderOverlay,.loader').fadeOut();
               //{ user: app.session.user.toJSON() }
            // } 
            return this;
        },

        events: {
                'click #loginButton' : 'submit',
                'blur #input-1' : 'avoidTextOverlap',
                'keyup #input-1' :'validateUsername'
         },

         submit : function(){
         if(this.validateUsername()){
             $('#loaderOverlay,.loader').show();
             var self = this;

              sandbox.session.login({
                    username: this.$("#input-1").val(),
                    
                }, {
                    success: function(mod, res){
                        //if(DEBUG) console.log("SUCCESS", mod, res);
                        debugger;
                        console.log(res);
                        self.destroyView();  
                        $('body').append('<section id="defectLogger"></section>');
                        new sandbox.views.DefectsView({
                            el :'#defectLogger'   
                        });
                    },
                    error: function(err){
                        console.log(err);
                       // if(DEBUG) console.log("ERROR", err);
                      self.render();
                      setTimeout(function(){
                       $('.toastMessage').text(err.error).fadeIn(400).delay(2000).fadeOut(400);   
                     },600);
                   }
               });
            }
            else{
              $('.toastMessage').text("Please enter a valid SOEID").fadeIn(400).delay(2000).fadeOut(400);   
            }

        },

        closeHelp : function(){
            alert("efw");
            $('.overlay').fadeOut();
            $('.helpOverlay').fadeOut('fast');
        },

      
        avoidTextOverlap : function(){
        if($('#input-1').val() !== ""){
        $('.input').addClass('input--filled');
            }else{
        $('.input').removeClass('input--filled');
        }
        },

        validateUsername : function(){
        var field = this.$el.find("#input-1");
        var pattern = new RegExp(/^[A-Za-z]{2}/);
        var val = $(field).val();
        
         if($(field).val().length > 0){
            var position = '7px '+ -(14 - ($(field).val().length * 3.9)) +'px';
            $('.eyes').css('background-position',position);
         }
         else{
            $('.eyes').css('background-position','7px -14px');
         }

          if(val !== "" && val.length === 7 && pattern.test(val))
              return true
         },

        destroyView : function(){
         this.undelegateEvents();
          this.remove();
          this.unbind();
     
        
        },


        // render: function() {
        //  // do stuff on render
        // $('#loaderOverlay,.loader').fadeOut();
        //  var template = _.template($(loginTemplate).html());
        //  this.$el.html(template());
        // }
    });
    return sandbox.views.Login;
}); 