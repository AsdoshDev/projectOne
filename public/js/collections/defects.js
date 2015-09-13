
var sandbox = sandbox || {};
sandbox.collections = {};

define(['backbone'], function(Backbone) {
    sandbox.collections.DefectsCollection = Backbone.Collection.extend({
    	url : 'http://cpb-dl.herokuapp.com/defects',
        model : sandbox.models.Defect,
        initialize: function() {
   
        },

        getDefectList : function(){
        	debugger;
        	var self = this;
		  this.fetch({
            success:  function(response){
	            _.each(response,function(item){
	              self.add(item);

	            });

            },
            error :  function(msg){
              	console.log(msg);
             }

         });
		
        },

    });
}); 