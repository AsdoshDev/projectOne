
var sandbox = sandbox || {};

define(['underscore','backbone','jquery','text!/templates/help.html'], function(_,Backbone,$,helpTemplate) {
    sandbox.views.Help = Backbone.View.extend({
        el: '.overlay',
        events: {
        'click .helpContainer,#helpIcon' : 'closeHelp',
         },

        closeHelp : function(){
             $('#exportTable,#themeIcon,#devlist,#logout').css({'bottom':'10px','left':'10px'});
            $('#menuIcon').addClass('close').removeClass('open');
             $('#colorContainer').remove();
            $('.overlay').fadeOut('fast',function(){
                $('.overlay').empty();    
            });
            $('.round,.header').css('pointer-events','');
            this.undelegateEvents();
            this.$el.removeData().unbind(); 
            
        },

        initialize: function() {
            // do stuff on initialize
            this.render();
        },

        render: function() {
         // do stuff on render
      
         var template = _.template($(helpTemplate).html());
         this.$el.html(template());
         $('.helpContainer').fadeIn();
        }
    });
    return sandbox.views.Help;
}); 