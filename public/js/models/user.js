/**
 * @desc		stores the POST state and response state of authentication for user
 */
define(['backbone','model_user'], function(Backbone) {
        sandbox.models.User = Backbone.Model.extend({
      initialize: function(){
       
        
        },

        defaults: {
            id: 0,
            name: '',
            soeid: '',
            email: ''
        },

        url: function(){
            return 'https://localhost:8080/user';
        }
    });
    return sandbox.models.User;
}); 

