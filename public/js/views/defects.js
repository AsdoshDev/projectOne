
var sandbox = sandbox || {};
sandbox.views ={};
define(['underscore','backbone','jquery',
  'table2excel','text!/templates/defects.html',
  "model_defect","collection_defects",'iscroll',
  "view_logDefect",'view_help'], function(_,Backbone,$,table2excel,defectTemplate) {
    sandbox.views.DefectsView = Backbone.View.extend({
        model : sandbox.models.Defect,
        el: '#defectLogger',
        events: {
          'click .row.header div' : 'showFilter' ,
          'click .selectAll' : 'selectAll',
          'click .filterList li' : 'checkboxClick',
          'click .filterOverlay':'hideFilter',
          'click #addDefect' : 'logDefect',
          'click #helpIcon' :'showHelp',
          'click #exportTable' :'convertTableToXLS',
          'keyup #searchInput' : 'filterId',
          'click .defectRow' : 'editDefect',
          'click #menuIcon' : 'showMenu',
          'click #themeIcon' : 'showColors',
          'click #colorContainer > div' :'changeTheme',
          'click #logout' :'logout',
           'click #devList' :'openDevCRList',
        },
        devCrList :  {
            "Karthik" : ["Employment","Optional ID Records","Multiple Inheritance","Address Proof and Exception Docs","GFCID"],
            "Satya" : ["Public Figure Status" ,"CRF Summary","Legacy Docs","Financial Documents","LOV Cleanup"],
            "Jugal" : ["Tabular View - Associated Members","Swiss Visibility - RB"],
            "Ranjith" : ["Public Figure Status","SPF Declassification","QA Research","Swiss Visibility - Profile Manager"],
            "Indu" : ["LFG","Assets Held Outside Citigroup","Maker Checker Changes"],
            "Ratna" : ["Optional RMC Fields - Basic Info","Rename Signer"],
            "Ramprasad" :  ["Enhanced Financial Totals"],
            "Shashank" : ["Communicate By Fields" ,"Address lines - Contact Info","Ultra High Net Worth"],
            "Rajesh" : ["Volcker Rule"]
        },

          openDevCRList : function(){
              $('.round,.header').css('pointer-events','none');
             var devArray = ["Karthik","Satya", "Jugal","Ranjith", "Indu", "Ratna","Ramprasad", "Shashank", "Rajesh"];
                     for(var i=0;i<devArray.length;i++){
                       $('#devCrList').append("<div class='fullRow'><div class='halfRow'>"+devArray[i]+"</div><div class='halfRow'>"+this.devCrList[devArray[i]]+"</div></div>")
                     }
                     $('#devCrList').show();
            },


          initialize: function() {
           this.model  = new sandbox.models.Defect(),
           this.collection = new sandbox.collections.DefectsCollection();
           this.listenTo(this.collection, 'change', this.render);
            this.collection.bind('add', this.render, this);
            // this.listenTo(this.collection, 'add', this.render);
            _.bindAll(this, "render");
             // do stuff on initialize
            this.render(); 
             var _thisView = this;
             // This uses jQuery's Demodel2ferred functionality to bind render() so it runs
             // after BOTH models have been fetched
              $.when(this.collection.fetch())
                .done(function () {
                _thisView.render();
              });
        },
        changeTheme : function(e){
            $( ".header .cr" ).trigger( "click" );
            if(!$('.overlay').is(':visible'))
            this.showHelp();
            var target = e.target;
            var stylesheet = './css/' + $(target).attr('id') + '.css';
           $('#theme').attr('href',stylesheet);
       },
        
        isChanging : function(){
          console.log("New Defect added to collection");
        },

        logout : function(){
           $('#loaderOverlay,.loader').fadeIn();
          var self = this;
            sandbox.session.logout({},{
                    success: function(res){
                        self.destroyView();
                        $('#loaderOverlay,.loader').fadeOut(function(){
                          if($('.login').length === 0){
                           $('body').append('<section class="login"></section>');
                            new sandbox.views.Login({});
                           $('.toastMessage').text(res.msg).fadeIn(400).delay(2000).fadeOut(400);     
                         }
                        });         
                    },
                    error: function(err){
                        console.log(err);
                       // if(DEBUG) console.log("ERROR", err);
                      self.render();
                      setTimeout(function(){
                       $('.toastMessage').text("Unable to log out.Please try again").fadeIn(400).delay(2000).fadeOut(400);   
                    },600);
                      
                   }
               });
            this.destroyView();
          },
          destroyView : function(){
             this.undelegateEvents();
          this.remove();
          this.unbind();
          },

          showColors : function(e){
            if($('#themeIcon').hasClass('close')){
                  $('#themeIcon').addClass('open').removeClass('close');
            var colours = {'006699':'deepblue','cc3333':'crimson','660f57':'magenta','ea6153':'red','006666':'green','f07818':'orange','330066':'violet','8c001a':'brown'};
            var colorKeys =_.keys(colours) 
            var colors = colorKeys.length;
            var values = _.values(colours);
            var pos = 20;
            $('#defectLogger').append('<div id="colorContainer"></div>')
              for(i=0;i<colors;i++){
                $('#colorContainer').append('<div id="'+values[i]+'" class="colours"></div>');
                $($('.colours')[i]).css({'left':pos+'px','background-color':colorKeys[i]});
                pos = pos+30;
              }
            }
            e.preventDefault();
            e.stopPropagation();
          },

        showMenu : function(e,triggered){
        if($('#menuIcon').hasClass('close')){
          $('#menuIcon').addClass('open').removeClass('close');
          if(!triggered)
          $('.filterOverlay').show();
          $('#exportTable').css({'bottom':'65px','left':'30px'});
          $('#themeIcon').css({'bottom':'120px','left':'60px'});
          $('#devList').css({'bottom':'170px','left':'95px'});
          $('#logout').css({'bottom':'220px','left':'135px'});
        }
        },
        editDefect : function(e){
            $('.header,.round').css('pointer-events','none');
            var targetIndex = $(e.currentTarget).index();
            var targetModel = sandbox.defects.at(targetIndex);
             if($('.modalWindow').length === 0)
            $('body').append('<section class="modalWindow"></section>');
            $('.overlay,.modalWindow').fadeIn('fast');
            new sandbox.views.LogDefect({
                 el :'.modalWindow',
                 collection:this.collection,
                 model : targetModel
            });
      
        },


        filterValues : function(defectsList){
          var filterValues = {};
          var columnHeaders = ['cr','section','developer','status','env','severity'];
          var colLength = columnHeaders.length;
          for(i=0;i<colLength;i++){
             var targetColumn = columnHeaders[i];
             filterValues[targetColumn] = [];
             var length = defectsList.length;
                for(j=0;j<length;j++){
                 var targetDefect = defectsList[j];
                 if(targetDefect[targetColumn] != "")
                 filterValues[targetColumn].push(targetDefect[targetColumn]);
                }
              var filteredAr = filterValues[targetColumn].length;
              var uniqueNames =[];
               for(k=0;k<filteredAr;k++){
                  if($.inArray(filterValues[targetColumn][k], uniqueNames) === -1) uniqueNames.push(filterValues[targetColumn][k]);
                }
            filterValues[targetColumn]  = uniqueNames;
          }
          this.json = sandbox.filterValues = filterValues;
     
        },

        render: function() {
           var defectsList;

              var self = this;
            
              /*------------------------LOCAL---------------------------*/
              // $('#loaderOverlay,.loader').fadeOut();
              //   var template = _.template($(defectTemplate).html());
              //   $.get('./data/defectsList.json',function(response){
              //     sandbox.defects  = response.defects;
              //    defectsList = response.defects;
              //    self.$el.html(template({defectsList:defectsList}));
              //     self.filterValues(defectsList);
              //      self.scroll = new IScroll('.defectContainer',{
              //         bounce:false,
              //           scrollbars:true,
              //           mouseWheel:true
              //       });

              //   });
              /*------------------------LOCAL---------------------------*/

              /*---------------------------DB---------------------------*/
            
                     this.$el.html('');
                     sandbox.defects = this.collection;
                     var template = _.template($(defectTemplate).html());
                     defectsList = self.collection.toJSON();
                     this.filterValues(defectsList);
                     this.$el.html(template({defectsList:defectsList}));

                    if(defectsList.length >0){
                      this.scroll = new IScroll('.defectContainer',{
                        bounce:false,
                        scrollbars:true,
                        mouseWheel:true
                      });
                      this.scroll.on('scrollStart', function(){
                         $('.defectRow').addClass("dragging");
                      });
                      this.scroll.on('scrollEnd', function(){
                        $('.defectRow').removeClass("dragging");
                      });
                     }


                      $('.dragging').bind('click',function (e) {
                              e.preventDefault();
                       });
                      debugger;
                       if(sandbox.updatedId){
                      $('#'+sandbox.updatedId +">div").addClass('fadeShadow');
                       $('#'+sandbox.updatedId).next().find('>div').addClass('fadeShadow');
                      setTimeout(function(){
                         $('#'+sandbox.updatedId +">div").removeClass('fadeShadow');
                         $('#'+sandbox.updatedId).next().find('>div').removeClass('fadeShadow');
                      },3500);
                    }
                    var currentUser = sandbox.user.toJSON().name;
                    if(!sandbox.firstTime){
                    $('.toastMessage').text("Hey "+ currentUser + "! Wassup Yo!").fadeIn(400).delay(2000).fadeOut(400);
                     sandbox.firstTime = true;   
                    }
               
                   $('#loaderOverlay,.loader').fadeOut();
              //  socket.on('new_defect', function (data) {
              //    console.log("New defect Logged ..Server just told me!!");
              // });
             //     success:  function(response){
                 
             // },
             //    error :  function(msg){
             //            console.log(msg);
             //         }

             //     });


                // sandbox.defects.bind("add", function(){
                //   console.log('Collection has changed.');
                // });

               /*------------------------DB---------------------------*/
         return this;
        },
        getDate : function(){
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
        },

        convertTableToXLS : function(){
        
         //close help 
          $('.overlay').fadeOut('fast',function(){
                $('.overlay').empty();    
            });

            var name = "defectLogger - "+this.getDate();
            $("#table2excel").table2excel({
            exclude: ".noExl",
            name: name
            });
        },

        showHelp : function(e){
           $('.round,.header').css('pointer-events','none');
             $('.overlay').fadeIn('fast');
            new sandbox.views.Help({
                 el :'.overlay'   
            });
            this.showMenu(e,true);
        },

        logDefect : function(){
          if($('.modalWindow').length === 0)
          $('body').append('<section class="modalWindow"></section>');
            $('.header,.round').css('pointer-events','none');
            //close help 
             $('.overlay').empty();    
             $('.overlay,.modalWindow').fadeIn('fast');
            new sandbox.views.LogDefect({
                 el :'.modalWindow',
                 collection:sandbox.defects 
            });
        },


hideMenu : function(){
    $('#exportTable,#themeIcon,#devlist,#logout').css({'bottom':'10px','left':'10px'});
    $('#themeIcon').addClass('close').removeClass('open');
    $('#colorContainer').remove();
},

        hideFilter : function(e){
        $('.filterOverlay,.filterList').hide();  
        $('#idSearch').hide();
        if($('#menuIcon').hasClass('open')){
          $('#menuIcon').addClass('close').removeClass('open');
            $('.filterOverlay').hide();
            this.hideMenu();
              $('.overlay').fadeOut('fast',function(){
                $('.overlay').empty();    
            });
        }
         $('.round,.header').css('pointer-events','');
        $('#devCrList').empty().hide();
        },
        createObjForSelectedFilter : function(){
         var tobeReturned ={};   
         var filteredColumns = [];
            var filterList = $('.filterList');
            if(filterList.length > 0){
                var mainObj = {};
                for(var i=0;i<filterList.length;i++){
                    var oneFilter = filterList[i];
                    if($(oneFilter).find('.checkbox').hasClass('checked')){
                        var targetElements = $(oneFilter).find('.checkbox.checked .text').toArray();
                        var id = $(oneFilter).attr('id');
                        filteredColumns.push(id);
                        var array = [];
                        for(var j=0;j<$(targetElements).length;j++){
                            array.push($($(targetElements)[j]).text());
                        }
                    }
                    // create an obj of all filtered columns with values selected.
                    mainObj[id] = array;
                }}
             
             // add/remove Filter icon for filtered columns
            this.addFilterIcon(filteredColumns);
            

            tobeReturned.mainObj = mainObj;
            tobeReturned.filteredColumns = filteredColumns;
            return tobeReturned;
        },


        addFilterIcon : function(filteredColumns){
            var length = filteredColumns.length; 
            $('.header > div').removeClass('filterIcon');
            if(filteredColumns.length > 0){
            for(var i=0;i<length;i++){  
                $('.header').find('.'+filteredColumns[i]).addClass('filterIcon');
            }}else{
                $('.header > div').removeClass('filterIcon');
            }
        },

        filterBasedOnClick : function(target){
            //SHOW FILTERED VALUES
            var obj = this.createObjForSelectedFilter();
            var filteredColumns = obj.filteredColumns;
            var mainObj = obj.mainObj;
            
            $('.defectRow').hide().addClass('hidden');          
            var rows = $('.defectRow');
           
            if(filteredColumns.length > 1){
            var length = filteredColumns.length; 
            for(var j=0;j<length;j++){
                if(mainObj[filteredColumns[j+6]]){
                     for(i=0;i<rows.length;i++){
            if(mainObj[filteredColumns[j]].indexOf($(rows[i]).find('.'+filteredColumns[j]).text()) > -1 &&
                mainObj[filteredColumns[j+1]].indexOf($(rows[i]).find('.'+filteredColumns[j+1]).text()) > -1 &&
                mainObj[filteredColumns[j+2]].indexOf($(rows[i]).find('.'+filteredColumns[j+2]).text()) > -1 &&
                mainObj[filteredColumns[j+3]].indexOf($(rows[i]).find('.'+filteredColumns[j+3]).text()) > -1 &&
                mainObj[filteredColumns[j+4]].indexOf($(rows[i]).find('.'+filteredColumns[j+4]).text()) > -1 &&
                mainObj[filteredColumns[j+5]].indexOf($(rows[i]).find('.'+filteredColumns[j+5]).text()) > -1 &&
                mainObj[filteredColumns[j+6]].indexOf($(rows[i]).find('.'+filteredColumns[j+6]).text()) > -1)
                 $(rows[i]).show().removeClass('hidden');
            }}
            else if(mainObj[filteredColumns[j+5]]){
                 for(i=0;i<rows.length;i++){
                if(mainObj[filteredColumns[j]].indexOf($(rows[i]).find('.'+filteredColumns[j]).text()) > -1 &&
                mainObj[filteredColumns[j+1]].indexOf($(rows[i]).find('.'+filteredColumns[j+1]).text()) > -1 &&
                mainObj[filteredColumns[j+2]].indexOf($(rows[i]).find('.'+filteredColumns[j+2]).text()) > -1 &&
                mainObj[filteredColumns[j+3]].indexOf($(rows[i]).find('.'+filteredColumns[j+3]).text()) > -1 &&
                mainObj[filteredColumns[j+4]].indexOf($(rows[i]).find('.'+filteredColumns[j+4]).text()) > -1 &&
                mainObj[filteredColumns[j+5]].indexOf($(rows[i]).find('.'+filteredColumns[j+5]).text()) > -1)
             $(rows[i]).show().removeClass('hidden');
            }}
             else if(mainObj[filteredColumns[j+4]]){
                 for(i=0;i<rows.length;i++){
                if(mainObj[filteredColumns[j]].indexOf($(rows[i]).find('.'+filteredColumns[j]).text()) > -1 &&
                mainObj[filteredColumns[j+1]].indexOf($(rows[i]).find('.'+filteredColumns[j+1]).text()) > -1 &&
                mainObj[filteredColumns[j+2]].indexOf($(rows[i]).find('.'+filteredColumns[j+2]).text()) > -1 &&
                mainObj[filteredColumns[j+3]].indexOf($(rows[i]).find('.'+filteredColumns[j+3]).text()) > -1 &&
                mainObj[filteredColumns[j+4]].indexOf($(rows[i]).find('.'+filteredColumns[j+4]).text()) > -1)
             $(rows[i]).show().removeClass('hidden');
}}
          else if(mainObj[filteredColumns[j+3]]){
             for(i=0;i<rows.length;i++){
                if(mainObj[filteredColumns[j]].indexOf($(rows[i]).find('.'+filteredColumns[j]).text()) > -1 &&
                mainObj[filteredColumns[j+1]].indexOf($(rows[i]).find('.'+filteredColumns[j+1]).text()) > -1 &&
                mainObj[filteredColumns[j+2]].indexOf($(rows[i]).find('.'+filteredColumns[j+2]).text()) > -1 &&
                mainObj[filteredColumns[j+3]].indexOf($(rows[i]).find('.'+filteredColumns[j+3]).text()) > -1)
                $(rows[i]).show().removeClass('hidden');
}}
            else if(mainObj[filteredColumns[j+2]]){
                 for(i=0;i<rows.length;i++){
                if(mainObj[filteredColumns[j]].indexOf($(rows[i]).find('.'+filteredColumns[j]).text()) > -1 &&
                mainObj[filteredColumns[j+1]].indexOf($(rows[i]).find('.'+filteredColumns[j+1]).text()) > -1 &&
                mainObj[filteredColumns[j+2]].indexOf($(rows[i]).find('.'+filteredColumns[j+2]).text()) > -1)
                $(rows[i]).show().removeClass('hidden');
}}

            else if(mainObj[filteredColumns[j+1]]){
                 for(i=0;i<rows.length;i++){
                if(mainObj[filteredColumns[j]].indexOf($(rows[i]).find('.'+filteredColumns[j]).text()) > -1 &&
                mainObj[filteredColumns[j+1]].indexOf($(rows[i]).find('.'+filteredColumns[j+1]).text()) > -1)
     
                $(rows[i]).show().removeClass('hidden');
}}
            
            }}

            if(filteredColumns.length == 1){
                 for(i=0;i<rows.length;i++){
            if(mainObj[filteredColumns[0]].indexOf($(rows[i]).find('.'+filteredColumns[0]).text()) > -1){
                 $(rows[i]).show().removeClass('hidden');
            }
            else{
                $(rows[i]).hide().addClass('hidden'); 
            }}}
       
                if(filteredColumns.length == 0){
               $('.defectRow').show().removeClass('hidden');
            
                  }

                this.checkNoResults();
                this.refreshScroll();
                //this.filterValues($('.defectRow:visible'));
                                 // refresh background color 
            },
            
            checkNoResults : function(){
               if($('.defectRow:visible').length < 1){
                    $('.defectContainer').append('<div class="noResults">Yay ! No results found</div>');
                }
                else{
                    $('.defectContainer .noResults').remove();
                }
                },

            refreshScroll: function(){
                if(this.scroll)
                this.scroll.refresh();
            },

        checkboxClick : function(e){
            var target = e.currentTarget;
            $(target).find('>div').toggleClass('checked');

            this.filterBasedOnClick($(target));
            this.showCount($(target));

            },
        selectAll : function(e){
            var target = e.currentTarget;
            if($(target).parents('.filterList').hasClass('checkedAll')){
                 $(target).parents('.filterList').removeClass('checkedAll');
                 $(target).parents('.filterList').find('li >div').removeClass('checked');    
            }
            else{
                 $(target).parents('.filterList').addClass('checkedAll');
                 $(target).parents('.filterList').find('li >div').addClass('checked');       
            }
            $(target).toggleClass('buttonActive');
            this.filterBasedOnClick();
            this.showCount($(target));
        },
          showCount : function(target){
            if($(target).parents('.listButtons').length == 0){
                var text = $(target).find('.text').text();
                var columnHeader =  $(target).parents('ul').attr('id');
                var rowLength = $('.defectRow').length;
                var count = 0;
                for(i=0;i<rowLength;i++){
                var targetRow = $('.defectRow')[i]; 
                if($(targetRow).find('.'+columnHeader).text() === text)
                count++;    
                }
                if($(target).find('.checkbox').hasClass('checked')){
                $(target).find('.count').show();
                $(target).find('.count').text(count);    
                }
                else{
                  $(target).find('.count').hide();
                }
            }
            else{
                var columnHeader =  $(target).parents('ul').attr('id');
                var listItems = $(target).parents('ul').find('li');
                var count;
                var rowLength = $('.defectRow').length;
                for(i=0;i<listItems.length;i++){
                    count = 0;
                    var listItem = $(listItems)[i];
                    var text = $(listItem).find('.text').text();

                    for(j=0;j<rowLength;j++){
                        var targetRow = $('.defectRow')[j]; 
                        if($(targetRow).find('.'+columnHeader).text() === text)
                        count++;    
                    }
                    if($(listItem).find('.checkbox').hasClass('checked')){
                        $(listItem).find('.count').show();
                        $(listItem).find('.count').text(count);    
                    }
                    else{
                        $(listItem).find('.count').hide();
                    }
                }
            }
            },

            filterId : function(e){
              var target =  e.currentTarget;
              $('.defectRow').hide(); 
              var rows =   $('.defectRow');
              if($(target).val() != ""){
                  $('.filterOverlay').show();
               for(i=0;i<rows.length;i++){
                 var targetRow = $('.defectRow')[i];
                 if($(target).hasClass('defectId')){
                  if($(targetRow).find('.defectId').text().match('^'+$(target).val())){
                    $(targetRow).show();
                     }
                     else{
                           this.checkNoResults();
                     }}
                     else if($(target).hasClass('desc')){
                      if($(targetRow).find('.desc:contains("'+ $(target).val()+'")')){
                       $(targetRow).show();
                     }
                     else{
                           this.checkNoResults();
                     }
                     }
            }}else{
                 $('.defectRow').show(); 
            }
            this.checkNoResults();
               this.refreshScroll();
            },
        showFilter : function(e){
            //close help 
            // $('.overlay').fadeOut('fast',function(){
            //     $('.overlay').empty();    
            // });
           // this.$el.find('#colorContainer').remove();
            //close menu
            //this.hideMenu();
            var target = e.currentTarget;
            var offset = $(target).offset();
              $('.filterOverlay').show();
            if($(target).hasClass('defectId') /*|| $(target).hasClass('desc') */){
              var tClass = $(target).attr('class');
              if($('#idSearch').length == 0){
               var  inputBox  ='<div id="idSearch"><input id="searchInput" class="'+tClass+'" type="text"></input><div>';
              $('.headerContainer').append(inputBox);
              $('#searchInput').focus();
              $('#idSearch').css('left',offset.left +'px');
            }else{
              $('#idSearch').show();
            }
            }
            else{
            $('.headerContainer .filterList').hide();
            
            var targetFilter = $(target).text();
            if(targetFilter === "Developer"){
             if($('.filterList.developer').length > 0)
                 $('.filterList.developer').show();
             else{
             userList  ='<ul id="developer" class="filterList developer"></ul>';
             $('.headerContainer').append(userList);
             for(var i=0;i<this.json.developer.length;i++){
             $('.filterList.developer').append('<li><div class="checkbox unchecked"><div class="text">'+ this.json.developer[i] + '</div><aside class="count"></aside></li>')
            }
            $('.filterList.developer').append('<div class="listButtons"><div class="selectAll">Select / Clear All</div></div>');
            }}
            if(targetFilter === "Severity"){
             if($('.filterList.severity').length > 0)
                 $('.filterList.severity').show();
             else{
             userList  ='<ul id="severity" class="filterList severity"></ul>';
            $('.headerContainer').append(userList);
            for(var i=0;i<this.json.severity.length;i++){
             $('.filterList.severity').append('<li><div class="checkbox unchecked"><div class="text">'+ this.json.severity[i] + '</div><aside class="count"></aside></li>')
            }
            $('.filterList.severity').append('<div class="listButtons"><div class="selectAll">Select / Clear All</div></div>');
            }}

            if(targetFilter === "Status"){
             if($('.filterList.status').length > 0)
                 $('.filterList.status').show();
             else{
             userList  ='<ul id="status" class="filterList status"></ul>';
             $('.headerContainer').append(userList);
                
            for(var i=0;i<this.json.status.length;i++){
             $('.filterList.status').append('<li><div class="checkbox unchecked"><div class="text">'+ this.json.status[i] + '</div><aside class="count"></aside></li>')
            }
            $('.filterList.status').append('<div class="listButtons"><div class="selectAll">Select / Clear All</div></div>');
            }}

            if(targetFilter === "ENV"){
             if($('.filterList.env').length > 0)
                 $('.filterList.env').show();
             else{
             userList  ='<ul id="env" class="filterList env"></ul>';
             $('.headerContainer').append(userList);
                
            for(var i=0;i<this.json.env.length;i++){
             $('.filterList.env').append('<li><div class="checkbox unchecked"><div class="text">'+ this.json.env[i] + '</div><aside class="count"></aside></li>')
            }
            $('.filterList.env').append('<div class="listButtons"><div class="selectAll">Select / Clear All</div></div>');
            }}
            if(targetFilter === "CR"){
             if($('.filterList.cr').length > 0)
                 $('.filterList.cr').show();
             else{
             userList  ='<ul id="cr" class="filterList cr"></ul>';
             $('.headerContainer').append(userList);
                
            for(var i=0;i<this.json.cr.length;i++){
             $('.filterList.cr').append('<li><div class="checkbox unchecked"><div class="text">'+ this.json.cr[i] + '</div><aside class="count"></aside></li>')
            }
            $('.filterList.cr').append('<div class="listButtons"><div class="selectAll">Select / Clear All</div></div>');
            }}
            if(targetFilter === "Module"){
             if($('.filterList.section').length > 0)
                 $('.filterList.section').show();
             else{
             userList  ='<ul  id="section" class="filterList section"></ul>';
             $('.headerContainer').append(userList);
                
            for(var i=0;i<this.json.section.length;i++){
             $('.filterList.section').append('<li><div class="checkbox unchecked"><div class="text">'+ this.json.section[i] + '</div><aside class="count"></aside></li>')
            }
            $('.filterList.section').append('<div class="listButtons"><div class="selectAll">Select / Clear All</div> </div>');
            }}
            var noDropdownArray =['ID','Description','Dev Comments','Created'];
            var selectedText = $(target).text();
            if(noDropdownArray.indexOf(selectedText) <= -1){
             if($(target).width() > 150){
                 $('.filterList').css('width',$(target).width());        
             }
             else{
                 $('.filterList').css('width','150px');
             }
            $('.filterList').css('top','52px');

          var leftChanged;
          if($('#defectLogger').width() - 150 < offset.left){
          leftChanged = offset.left -100;
          $('.filterList:visible').find(':before').css('left','80%');
            $('.filterList').css('left',leftChanged+'px');
          }else{
           $('.filterList').css('left',offset.left +'px'); 
          }
           }else{
             $('.headerContainer .filterList').hide();
            }}
        },
        
    });
    return sandbox.views.DefectsView;
}); 
