
var sandbox = sandbox || {};
sandbox.models ={};
        define(['backbone'], function(Backbone) {
        sandbox.models.Defect = Backbone.Model.extend({
            urlRoot : 'http://cpb-dl.herokuapp.com/defects',
        defaults : {
            section:"",
            cr:"",
            desc:"",
            severity:"",
            status:"",
            env:"",
            developer:"",
            devComment:"",
            date :"",
            steps : [],
            loggedBy :""

        },
        idAttribute : "_id",

        setData : function(response){
        if(response){
            this.set('section',response.section != ""?response.section : "");
            this.set('cr',response.cr != ""?response.cr : "");
            this.set('desc',response.desc != ""?response.desc : "");
            this.set('severity',response.severity != ""?response.severity : "");
            this.set('status',response.status != ""?response.status : "");
            this.set('env',response.env != ""?response.env : "");
            this.set('developer',response.developer != ""?response.developer : "");
            this.set('devComment',response.devComment != ""?response.devComment : "");
            this.set('date',response.date != ""?response.date : "");
            this.set('loggedBy',sandbox.user.toJSON().name);
            if(response.steps && response.steps.length >0){
            var steps = [];
            for(i=0;i<response.steps.length;i++){
                steps.push(response.steps[i]);
                }
            this.set('steps',steps);
            }
            return this;
        }
        },

        initialize: function() {
            // do stuff on initialize
        },


    });
    return sandbox.models.Defect;
}); 
