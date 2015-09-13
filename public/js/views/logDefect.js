
var sandbox = sandbox || {};

define(['underscore','backbone','jquery','text!/templates/logDefect.html'], function(_,Backbone,$,logDefectTemplate) {
    sandbox.views.LogDefect = Backbone.View.extend({
        el: '.modalWindow',
        count : 2,
        events: {
        'click #cancelDefect' : 'closePopup',
        'click #submit,#update' : 'validateForm',
        'click #steps' : 'openSteps',
        'click .steps.add' : 'addTextarea',
        'click .steps.delete' : 'removeTextarea',
        'click .back' : 'navigateBack',
        'change select' : 'removeValidation',
        },
           initialize: function() {
            // do stuff on initialize
            // this.template = _.template($('#hello-template').html());
            // this.listenTo(this.collection, 'add', this.echo);
            // this.listenTo(this.collection, 'change', this.echo);
            
            this.render(); 

            // hide the loader overlay
            //console.log('Initializing view buddy');
          },

            echo : function(){
                console.log("Something changed!!");
            },
          render: function() {
         // do stuff on render
            var template = _.template($(logDefectTemplate).html());
            if(this.model){
                this.$el.html(template({staticData:this.staticData,model :this.model.toJSON()}));
            }
            else
            this.$el.html(template({staticData:this.staticData,model :""}));
            
            this.defectScroll = new IScroll('.scrollContainer',{
                bounce:false,
                scrollbars:true,
                mouseWheel:true
               });
            this.defectScroll.refresh(); 
            return this;

        },
        destroy_view: function() {
        // COMPLETELY UNBIND THE VIEW
            this.undelegateEvents();
          this.remove();
          this.unbind();
     
        },
        addTextarea: function(e){
            $('.stepContainer .steps').remove();
            var length = $('.stepTextarea').length;
            this.count = length +1 ;
            var name = "step" + this.count;

            $('.stepScroll').append('<div class="stepContainer"><label for="'+name+'"> Step '+this.count+':</label><textarea class="stepTextarea"  name="steps" id="'+name+'" maxlength="2000" width="300"></textarea>'
            +'<button type="button" class="steps add"></button><button type="button" class="steps delete"></button></div>');
            this.count++;
            this.defectScroll.refresh();
            e.preventDefault();
            e.stopPropagation(); 
            this.$el.find('textarea:last').focus();
        },
        removeTextarea: function(){
            $('.stepContainer:last').remove();
            if($('.stepContainer').length >1)
                $('.stepContainer:last').append('<button type="button" class="steps add"></button><button  type="button" class="steps delete"></button>');
            else
                $('.stepContainer:last').append('<button type="button" class="steps add"></button>');
            this.count--;
            this.defectScroll.refresh(); 
            this.$el.find('textarea:last').focus();
        },
        navigateBack : function(){
        $('#addStepsSection').fadeOut('fast',function(){
                        $('#addDefectSection').fadeIn('fast');
                    });
        },
        openSteps : function(){
            var self = this;
            $('#addDefectSection').fadeOut('fast',function(){
                $('#addStepsSection').fadeIn('fast',function(){
                    debugger;
                     self.defectScroll.refresh();
                  $('.stepTextarea:first').focus();  
                });
            });
           
        },
        closePopup : function(){
            //$(".stepContainer:not(:first)").remove();
            $('.overlay').fadeOut('fast');
            $('.modalWindow').fadeOut('fast');
            $('.header,.round').css('pointer-events','');
            this.destroy_view();
        },

       removeValidation : function(e){
        var target = e.target;
        if($(target).hasClass('bs') && $(target).val() !== "")
            $(target).removeClass('bs');
        },

       validateForm : function(){
        var mndtryFlds = ['severity','developer','desc','status'];
        var length = mndtryFlds.length;
        var allFilled = false;
        for(var i=0;i<length;i++){
            if(this.$el.find('#'+mndtryFlds[i]).val() !== "")
                allFilled = true;
            else{
                allFilled =false;
                break;
            }
        }

        if(allFilled)
             this.submitDefect();
        else{
             for(var i=0;i<length;i++){
                if(this.$el.find('#'+mndtryFlds[i]).val() === "")
                     this.$el.find('#'+mndtryFlds[i]).addClass('bs');
             }
        }

       },
        submitDefect : function(){
            //var count = this.collection.length+1;
            var model = this.model ? this.model : new sandbox.models.Defect();
            model.set('section',$('#section').val());
            model.set('cr',$('#cr').val());
            model.set('date',$('#date').val());
            model.set('env',$('#env').val());
            model.set('devComment',$('#devComment').val());
            model.set('severity',$('#severity').val()); 
            model.set('developer',$('#developer').val());
            model.set('desc',$('#desc').val());
            model.set('status',$('#status').val());
            if(!this.model){
            model.set('loggedBy',sandbox.user.toJSON().name);
            model.set('isNew',true);                          
            }
            else{
               model.set('isNew',false);     
            }
            var stepsArray = [];
            var length = $('.stepTextarea').length;
            for(i=0;i<length;i++){
                if($($('.stepTextarea')[i]).val() != ""){
                    var val = $($('.stepTextarea')[i]).val();
                    stepsArray.push(val);
                }
            }
            model.set('steps',stepsArray);
           // this.collection.add(model);
            var successMsg;
            var errorMsg;
              $('#loaderOverlay,.loader').show();
              $('.overlay').hide();
            // UPDATE DEFECT MESSAGES
            if(model.get('isNew') === false){
                successMsg = "Defect Updated Successfully";
                errorMsg = "Defect Update Failed.Please try again";
                 model.save(null, {
                    success: function(response){
                    $('.overlay').fadeOut('fast');
                    $('.modalWindow').fadeOut('fast');
                    $('.toastMessage').text(successMsg).fadeIn(400).delay(2000).fadeOut(400); 
                     $('#loaderOverlay,.loader').fadeOut();
                },
                error : function(){
                         $('.toastMessage').text(errorMsg).fadeIn(400).delay(2000).fadeOut(400); 
                          $('#loaderOverlay,.loader').fadeOut(); 
                    }
                });
                
            }
            // SAVE DEFECT MESSAGES
            else{
                successMsg = "Defect Logged Successfully";
                errorMsg = "Failed to log the defect.Please try again";
                this.collection.create(model,{
                    success: function(response){
                    $('.overlay').fadeOut('fast');
                    $('.modalWindow').fadeOut('fast');
                    $('.toastMessage').text(successMsg).fadeIn(400).delay(2000).fadeOut(400);
                     $('#loaderOverlay,.loader').fadeOut(); 
                },
                error : function(){
                     $('.toastMessage').text(errorMsg).fadeIn(400).delay(2000).fadeOut(400); 
                      $('#loaderOverlay,.loader').fadeOut(); 
                }
            });
            }
            var self = this;
            this.destroy_view();                
            
        },
        staticData :{
        "section" : ["","PM", "RB","UHNW","LFG"],
        "cr" : ["","General Issues","Optional ID Records", "CRF Summary","Tabular View","GFCID","SPF Declasification","Financial Docs","Manual Record Approval","Multiple Inheritance"],
        "severity": ["","High", "Low","Medium","No effect","Show stopper"],
        "status": ["","Open", "Fixed","OS issue","AIP","WIP","Not an issue","Not able to reproduce","Retest","Reopened","Closed"],
        "env": ["","LOCAL", "DEV","IST","UAT"],
        "developer": ["","Satya","Vikas","Shashank", "Karthik","Jugal","Ranjith","Indu","Rajesh","Ratna","Ram","All"]
        },
        initialize: function() {
            // do stuff on initialize
            this.render();
        },

    });
    return sandbox.views.LogDefect;
}); 