tinymce.PluginManager.add("rdface", function(a,b) {
	// will return true if editor is inline
	// console.log('Inline: '+(a.inline?'yes':'no'));
	
	a.addButton("rdfaceMain", {
		type:'listbox',
		text : "RDFaCE",
		icon : !1,
		values:[
		        {
		        	text:'Annotated Entities',
		        	menu:[
		        	      {
		        	    	  text:'Faceted Viewing',
		        	    	  onclick:function(){
		      		    			a.windowManager.open({
		    		    				title : "Faceted Viewing",
		    		    				url : b + "/facets.htm",
		    		    				width : 500,
		    		    				height : 260
		    		    			});
		    		    			window.rdface_editor = a;
		    		    	        window.rdface_plugin_url = b;
		        				}
		        	      },
		        	      {
		        	    	  text:'Show All',
		        	    	  onclick:function(){
		        					show_entities(a,'all');
		        				}
		        	      },
		        	      {
		        	    	  text:'Hide All',
		        	    	  onclick:function(){
		        					show_entities(a,'none');
		        				}
		        	      },
		        	      {
		        	    	  text:'Remove All',
		        	    	  onclick:function(){
		        	    		  remove_annotations(a,0);
		        				}
		        	      }
		        	      ]
		        },
		        {
		        	text:'Configuration',
		    		onclick : function() {
		    			a.windowManager.open({
		    				title : "RDFaCE Settings",
		    				url : b + "/setting.htm",
		    				width : 500,
		    				height : 360
		    			})
		    			window.rdface_editor = a;
		    	        window.rdface_plugin_url = b;
		    		}
		        },
		        {
		        	text:'HTML Source Code',
		    		onclick : function() {
		    			a.windowManager.open({
		    				title : "HTML Source Code",
		    				url : b + "/source.htm",
		    				width : 520,
		    				height : 330,
		    				buttons : [/* 
		   		    				{
				    					text : "Update",
				    					onclick : function(e) {
				    						console.log(e.currentTarget);
				    					}
				    				},*/
		    				        {
				    					text : "Close",
				    					onclick : "close"
		    				}]
		    			})
		    			window.rdface_editor = a;
		    	        window.rdface_plugin_url = b;
		    		}
		        },
		        {
		        	text:'About RDFaCE',
		    		onclick : function() {
		    			a.windowManager.open({
		    				title : "About RDFaCE",
		    				url : b + "/help.htm",
		    				width : 500,
		    				height : 330,
		    				buttons : [ {
		    					text : "Close",
		    					onclick : "close"
		    				} ]
		    			})
		    		}
		        }
		        ]
	});
	a.addButton("rdfaceRun", {
		text : "Annotate",
		tooltip : "Automatically annotate content",
		icon : !1,
		onclick : function(v1) {
			var aF=jQuery.cookie("annotationF");
			a.windowManager.open({
				title : "Annotating content...",
				url : b + "/annotate.htm",
				width : 500,
				height : 330,
				buttons : [ {
					text : "Close",
					onclick : "close"
				} ]
			});
			window.rdface_editor = a;
	        window.rdface_plugin_url = b;
			window.rdface_annotationF = aF;
		}
	});
	a.addCommand("showTooltips", function() {
		editor=a;
		var xOffset = -10; // x distance from mouse
		var yOffset = 10; // y distance from mouse
		jQuery.each(jQuery(editor.getDoc()).find('.r_entity'), function(index, value) { 
			// show tooltips if word count <6
			if(countWords(jQuery(value).text())<6){
				jQuery(this).unbind('click').click(function(e) {
					e.stopPropagation();
					editor.execCommand('editEntity',jQuery(this));
				});	
				jQuery(this).unbind('mouseover').mouseover(function(e) {								
					e.stopPropagation();
					var top = (e.pageY + yOffset); var left = (e.pageX + xOffset);
					jQuery(this).css("background-color","orange");
					//console.log(jQuery(this));
					jQuery(this).css("cursor","pointer");
					jQuery(this).append(' <span id="typeof'+index+'" class="tooltip"><img id="arrow'+index+'" class="arrow"/>'+prepareTooltipContent(jQuery(this),0)+'</span>');
					jQuery(editor.getDoc()).find('span#typeof'+index+' #arrow'+index).attr("src", b + "/img/arrow.png");
					jQuery(editor.getDoc()).find('span#typeof'+index).css("top", top+"px").css("left", left+"px");
				});
				jQuery(this).unbind('mousemove').mousemove(function(e) {
					var top = (e.pageY + yOffset);
					var left = (e.pageX + xOffset);
					jQuery(editor.getDoc()).find('span#typeof'+index+' #arrow'+index).attr("src", b + "/img/arrow.png");
					jQuery(editor.getDoc()).find('span#typeof'+index).css("top", top+"px").css("left", left+"px"); 
				});										
				jQuery(this).unbind('mouseout').mouseout(function() {
					jQuery(this).css("background-color","");
					jQuery(this).css("cursor","");
					jQuery(editor.getDoc()).find('span#typeof'+index).remove();
					jQuery(this).html(jQuery(this).html().trim());// remove one space
				});	
		   }else{
			   // we should show an appended icon to edit the entity
				jQuery(this).unbind('mouseover').mouseover(function(e) {								
					// e.stopPropagation();
					var position = jQuery(this).position();
					if(position.top<10){
						if(jQuery(editor.getDoc()).find('#inline_edit_btn'+index).length){
							jQuery(editor.getDoc()).find('#inline_edit_btn'+index).css('left',position.left).css('top',jQuery(this).height()+10);
						}else{
							jQuery(this).before('<div id="inline_edit_btn'+index+'" style="position:absolute;z-index:199;left:'+(position.left)+'px;top:'+(jQuery(this).height()+10)+'px;"><a class="btn small">Edit '+getTypeOfEntity(jQuery(this),jQuery.cookie("annotationF"))+'</a></div>');
						}	
					}else{
						if(jQuery(editor.getDoc()).find('#inline_edit_btn'+index).length){
							jQuery(editor.getDoc()).find('#inline_edit_btn'+index).css('left',position.left).css('top',position.top-25);
						}else{
							jQuery(this).before('<div id="inline_edit_btn'+index+'" style="position:absolute;z-index:199;left:'+(position.left)+'px;top:'+(position.top-25)+'px;"><a class="btn small">Edit '+getTypeOfEntity(jQuery(this),jQuery.cookie("annotationF"))+'</a></div>');
						}
					}
				});
				jQuery(this).unbind('mousemove').mousemove(function(e) {
					// e.stopPropagation();
					var position = jQuery(this).position();
					if(position.top<10){
						if(jQuery(editor.getDoc()).find('#inline_edit_btn'+index).length){
							jQuery(editor.getDoc()).find('#inline_edit_btn'+index).css('left',position.left).css('top',jQuery(this).height()+10);
						}else{
							jQuery(this).before('<div id="inline_edit_btn'+index+'" style="position:absolute;z-index:199;left:'+(position.left)+'px;top:'+(jQuery(this).height()+10)+'px;"><a class="btn small">Edit '+getTypeOfEntity(jQuery(this),jQuery.cookie("annotationF"))+'</a></div>');
						}	
					}else{
						if(jQuery(editor.getDoc()).find('#inline_edit_btn'+index).length){
							jQuery(editor.getDoc()).find('#inline_edit_btn'+index).css('left',position.left).css('top',position.top-25);
						}else{
							jQuery(this).before('<div id="inline_edit_btn'+index+'" style="position:absolute;z-index:199;left:'+(position.left)+'px;top:'+(position.top-25)+'px;"><a class="btn small">Edit '+getTypeOfEntity(jQuery(this),jQuery.cookie("annotationF"))+'</a></div>');
						}
					}
				});										
				jQuery(this).unbind('mouseout').mouseout(function(e) {
					// e.stopPropagation();
					var refObj=jQuery(this);
				    var timeoutId = setTimeout(function(){
				    	jQuery(editor.getDoc()).find('#inline_edit_btn'+index).remove();
				    }, 800);
				    jQuery(editor.getDoc()).find('#inline_edit_btn'+index).mouseover(function(ev) {
				    	ev.stopPropagation();
				    	clearTimeout(timeoutId);
					});
				    jQuery(editor.getDoc()).find('#inline_edit_btn'+index).mouseout(function(ev) {
				    	ev.stopPropagation();
				    	jQuery(editor.getDoc()).find('#inline_edit_btn'+index).remove();
					});	
				    jQuery(editor.getDoc()).find('#inline_edit_btn'+index).click(function(ev) {								
						ev.stopPropagation();
						if(jQuery(editor.getDoc()).find('#inline_edit_btn'+index).length){
							jQuery(editor.getDoc()).find('#inline_edit_btn'+index).remove();
							editor.execCommand('editEntity',refObj);
						}
					});
				});
			   
		   }

		});
		jQuery.each(jQuery(editor.getDoc()).find('.r_prop'), function(index, value) {
			jQuery(this).unbind('mouseover').mouseover(function(e) {								
				e.stopPropagation();
				var top = (e.pageY + yOffset); var left = (e.pageX + xOffset);
				jQuery(this).css("background-color","#FFFC00");
				//console.log(jQuery(this));
				jQuery(this).append(' <span id="typeof'+index+'" class="tooltip"><img id="arrow'+index+'" class="arrow"/>'+prepareTooltipContent(jQuery(this),1)+'</span>');
				jQuery(editor.getDoc()).find('span#typeof'+index+' #arrow'+index).attr("src", b + "/img/arrow.png");
				jQuery(editor.getDoc()).find('span#typeof'+index).css("top", top+"px").css("left", left+"px");
			});
			jQuery(this).unbind('mousemove').mousemove(function(e) {
				var top = (e.pageY + yOffset);
				var left = (e.pageX + xOffset);
				jQuery(editor.getDoc()).find('span#typeof'+index+' #arrow'+index).attr("src", b + "/img/arrow.png");
				jQuery(editor.getDoc()).find('span#typeof'+index).css("top", top+"px").css("left", left+"px"); 
			});										
			jQuery(this).unbind('mouseout').mouseout(function() {
				jQuery(this).css("background-color","");
				jQuery(editor.getDoc()).find('span#typeof'+index).remove();
				jQuery(this).html(jQuery(this).html().trim());// remove one space
			});	
		});
	});
	a.addCommand("editEntity", function(v1) {
		var entity_type,param;
		var aF=jQuery.cookie("annotationF");
		if(aF=="RDFa"){
				entity_type=v1.attr('typeof').split(':')[1];
				// send the content as parameter
				param= v1.find('span[property="schema:name"]').text();
		}else{
				entity_type=v1.attr('itemtype').split('http://schema.org/')[1];
				// send the content as parameter
				param= v1.find('span[itemprop="name"]').text();
		}
			var file,height,width;
			file=b + "/schema.htm";
			height=500;
			width=500;
			a.windowManager.open({
				title: "Edit "+entity_type,
				url: file,
				width :500,
				height : 500
				/*
				 * ,buttons : [ { text : "Close", onclick : "close" } ]
				 */
			})
			window.rdface_editor = a;
	        window.rdface_plugin_url = b;
			window.rdface_entity_type = entity_type;
			window.rdface_selected_txt = param;
			window.rdface_annotationF = aF;
			window.rdface_pointer = v1;
	});							
	a.on("NodeChange",function(e){
		a.execCommand('showTooltips');
	})
	a.on("LoadContent",function(e){
		// detect existing annotations
		// todo:check if they are in the scope of selected schemas or not
		var aF=jQuery.cookie("annotationF");
		var editor=a;
		var format=aF;
		// for RDFa and Microdata
		// ToDo: does not work if user uses 'vocab' attribute
		var tmp;
		if(format=='RDFa'){
			jQuery.each(jQuery(editor.getDoc()).find('*[typeof]'), function(key,value){
				tmp=jQuery(value).attr('typeof');
				tmp='r_'+tmp.split(':')[1].toLowerCase();
				if(!jQuery(value).hasClass('r_entity')){
					jQuery(value).addClass('r_entity');
				}
				// specific entity class
				if(!jQuery(value).hasClass(tmp)){
					jQuery(value).addClass(tmp);
				}
			});		
		}else{
			jQuery.each(jQuery(editor.getDoc()).find('*[itemtype]'), function(key,value){
				tmp=jQuery(value).attr('itemtype');
				tmp='r_'+tmp.split('http://schema.org/')[1].toLowerCase();
				if(!jQuery(value).hasClass('r_entity')){
					jQuery(value).addClass('r_entity');
				}
				// specific entity class
				if(!jQuery(value).hasClass(tmp)){
					jQuery(value).addClass(tmp);
				}
			});			
		}
		a.execCommand('showTooltips');
	})	
	a.on("submit",function(e){
		// remove the classes added for visualization in
		// the editor
	})		
	// set RDFa as default annotation format
	if(!jQuery.cookie("annotationF")){
		// set RDFa as default annotation format
		setCookie("annotationF","RDFa",30);
	}
 // get selected schemas
	jQuery.getJSON(b+'/schema_creator/selection.json', function(data) {
		// added first level schemas to context menu
		a.on("contextmenu",function(event){
			// menu.removeAll();
	        // find a way to add it into current context menu instead of
			// deleting it
			/*
			// inline
			if(a.inline){
		        jQuery(a.getDoc()).find(' .mce-floatpanel.mce-menu').hide();
			}else{
		        // iframe
		        jQuery(' .mce-floatpanel.mce-menu').hide();
			}
			
			editor.addMenuItem('rdface', {
        text: '&nbsp;',
        context: 'tools',
        onclick: function() {
          editor.insertContent("&nbps;");
        }
      });
      */
	        main_menu=[];
			// show only related entities
			var parent_node=jQuery(event.target);
	    var has_rel=0;
	    var all_datatypes=[];
	    jQuery.each(data.types,function(i,v){
        all_datatypes.push(v.id);
			})
			var menu_options=[];
      while(parent_node.length){
        if(parent_node.hasClass('r_entity')){
          has_rel=1;
          // get the type of entity
          var entity_type=getTypeOfEntity(parent_node,jQuery.cookie("annotationF"));
          jQuery.each(data.types[entity_type].properties,function(i,v){
            // only show atomic
        // properties
            if(all_datatypes.indexOf(data.properties[v].ranges[0]) != -1){
                menu_options.push({text:data.properties[v].label,onclick: function(){insert_entity(a,data.properties[v].ranges[0],b,data.properties[v].id);}}) 
            }
          })
          break;
        }
        parent_node=parent_node.parent();
      }
      var del_node;
      // todo: enable deleting entities as well
      while(parent_node.length){
        del_node=parent_node;
        if(parent_node.hasClass('r_prop') || parent_node.hasClass('r_entity')){
          main_menu.push({text:'Delete', onclick: function(){
          remove_annotation(del_node,jQuery.cookie("annotationF"));
          a.setContent(jQuery(a.getBody()).html());
          }})
          break;
        }
	      parent_node=parent_node.parent();   
	    }
	    if(!has_rel){
				var others={};
				jQuery.each(data.types,function(i,v){
					if(v.level==1){
            menu_options.push({text:v.label,onclick:function(){
							insert_entity(a,v.id,b,0);
						}});
					}else{
						others[v.id]=v.label;
					}
				})
				menu_options2 = [];
				jQuery.each(others,function(i,v){
					 menu_options2.push({text:v,onclick:function(){
						 insert_entity(a,i,b,0);
					}});
				});
				menu_options.push({text:'More...',menu:menu_options2});
	    }
	    if(menu_options.length) {
        main_menu.push({text:'Add as Entity', menu:menu_options})
      }
      // add related properties based on the selected schema
      parent_node=jQuery(event.target);
      menu_options = [];
      while(parent_node.length){
        if(parent_node.hasClass('r_entity')){
          // get the type of entity
          var entity_type=getTypeOfEntity(parent_node,jQuery.cookie("annotationF"));
          
          jQuery.each(data.types[entity_type].properties,function(i,v){
            // only show atomic properties
            if(all_datatypes.indexOf(data.properties[v].ranges[0]) == -1){
              menu_options.push({text:data.properties[v].label,onclick:function(){
                insert_property(a,data.properties[v].id,b);
              }});
            }
          })
          main_menu.push({text:'Add as Property', menu:menu_options})
          break;
        }
        parent_node=parent_node.parent();
      }

      // recreate a custom context menu, based on original: https://github.com/tinymce/tinymce/blob/master/js/tinymce/plugins/contextmenu/plugin.js
      var editor = tinymce.activeEditor;
      var contextmenu, doc = editor.getDoc();
      contextmenu = editor.settings.contextmenu || 'link image inserttable | cell row column deletetable';
      var menu, items = [];
      tinymce.each(contextmenu.split(/[ ,]/), function(name) {
        var item = editor.menuItems[name];

        if (name == '|') {
          item = {text: name};
        }

        if (item) {
          item.shortcut = ''; // Hide shortcuts
          items.push(item);
        }
      });
      
      for (var i = 0; i < items.length; i++) {
          if (items[i].text == '|') {
              if (i === 0 || i == items.length - 1) {
                  items.splice(i, 1);
              }
          }
      }

      //separator
      items.push({text:'|', shortcut: '', type: 'menuitem'})
      
      //RDFaCE items
      for (var i = 0; i < main_menu.length; i++) {
        if (main_menu[i]["text"] == "Delete") {
          items.push({text:main_menu[i]["text"], onclick:main_menu[i]["onclick"]});
        }else{
          items.push({text:main_menu[i]["text"], menu:main_menu[i]["menu"]});
        }
      }
     
      menu = new tinymce.ui.Menu({items:items,context:"contextmenu"}),menu.renderTo(document.body);
      var r={x:event.pageX,y:event.pageY};
      a.inline||(r=tinymce.DOM.getPos(a.getContentAreaContainer()),r.x+=event.clientX,r.y+=event.clientY),menu.moveTo(r.x,r.y),a.on("remove",function(){menu.remove(),t=null})
		});	
	});    
});
// some helper functions
jQuery.cookie = function(name, value, options) {
    if (typeof value != 'undefined') { // name and value given, set cookie
        options = options || {};
        if (value === null) {
            value = '';
            options.expires = -1;
        }
        var expires = '';
        if (options.expires && (typeof options.expires == 'number' || options.expires.toUTCString)) {
            var date;
            if (typeof options.expires == 'number') {
                date = new Date();
                date.setTime(date.getTime() + (options.expires * 24 * 60 * 60 * 1000));
            } else {
                date = options.expires;
            }
            expires = '; expires=' + date.toUTCString(); // use expires attribute, max-age is not supported by IE
        }
        // CAUTION: Needed to parenthesize options.path and options.domain
        // in the following expressions, otherwise they evaluate to undefined
        // in the packed version for some reason...
        var path = options.path ? '; path=' + (options.path) : '';
        var domain = options.domain ? '; domain=' + (options.domain) : '';
        var secure = options.secure ? '; secure' : '';
        document.cookie = [name, '=', encodeURIComponent(value), expires, path, domain, secure].join('');
    } else { // only name given, get cookie
        var cookieValue = null;
        if (document.cookie && document.cookie != '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = jQuery.trim(cookies[i]);
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) == (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
};
function countWords(sentence){
	var s = sentence;
	s = s.replace(/(^\s*)|(\s*jQuery)/gi,"");
	s = s.replace(/[ ]{2,}/gi," ");
	s = s.replace(/\n /,"\n");
	return s.split(' ').length;
}
function getTypeOfEntity(entityObj,ann_type){
	if(ann_type=="RDFa"){
		return entityObj.attr('typeof').split(':')[1];
	}else{
		return entityObj.attr('itemtype').split('http://schema.org/')[1];
	}	
}
function prepareTooltipContent(entityObj,is_property){
	//console.log(entityObj);
  if(jQuery.cookie("annotationF")=="RDFa"){
		if(is_property){
			output=entityObj.attr('property').split(':')[1];
			//console.log(entityObj.attr('property')+' - '+output)
		}else{
			var entityType=getTypeOfEntity(entityObj,'RDFa');
			var output="<ul class='tooltip-t' style='list-style: none;text-align:left;margin:0 0 0 0;padding-left: 1em;text-indent: -1em;'>";
			if(entityObj.attr('property')){
				output +="<li>"+entityObj.attr('property').split(':')[1]+"</li>";
			}
			output +="<li>Type: <b>"+entityType+"</b></li>";
			output +="</ul>";
			//console.log(entityType);
		}
	}else{
		if(is_property){
			output=entityObj.attr('itemprop');
		}else{
			var entityType=getTypeOfEntity(entityObj,'Microdata');
			var output="<ul class='tooltip-t' style='list-style: none;text-align:left;margin:0 0 0 0;padding-left: 1em;text-indent: -1em;'>";
			if(entityObj.attr('itemprop')){
				output +="<li>"+entityObj.attr('itemprop')+"</li>";
			}
			output +="<li>Type: <b>"+entityType+"</b></li>";
			output +="</ul>";	
		}

	}
	//console.log(output);
	return output;
}
// Insert RDFa/Microdata attributes to HTML DOM tree
function insert_entity(editor,entity_type,b,has_rel){
	var selectedContentText=editor.selection.getContent({format : 'text'})
  var selectedContent = "[html]"+selectedContentText+"[/html]";
	var selectedNode = editor.selection.getNode();
	var nodeContent = selectedNode.innerHTML;
	// remove tinymce redundant data-mcs-href attribute
	nodeContent = nodeContent.replace(/\s(data-mce-href=)".*?"/g, "");
	nodeContent = nodeContent.replace(/\s(xmlns=)".*?"/g, "");
	selectedContent = selectedContent.replace("[html]", "");
	selectedContent = selectedContent.replace("[/html]", "");
	// console.log(selectedContent);
	if(!selectedContent){
		alert('Please select some text first!');
		return null;
	}
	var tmp=jQuery(selectedContent);
	// get an URI for entity
	var uri='';
	// todo: we can get a uri for entity as well
	if(jQuery.cookie("annotationF")=="RDFa"){
		if(tmp.length){
			if(tmp.length>1){
				// console.log('add new div');
				var temp = ' class="r_entity r_'+entity_type.toLowerCase()+'" typeof="schema:'+entity_type+'"';
				if(uri){
					temp=temp+' resource="'+uri+'"';
				}
				if(has_rel){
					temp=temp+' property="schema:'+has_rel+'"';
				}
				var annotatedContent;
				annotatedContent = "<div" + temp + ">" + selectedContent
				+ "</div>";
				editor.selection.setContent(annotatedContent);
				//editor.execCommand('mceInsertRawHTML', false,annotatedContent);
			}else{
				// console.log('update selected content');
				editor.dom.setAttrib(selectedNode,"typeof",'schema:'+entity_type);
				if(uri){
					editor.dom.setAttrib(selectedNode,"resource",uri);
				}
				if(has_rel){
					editor.dom.setAttrib(selectedNode,"property",'schema:'+has_rel);
				}
				editor.dom.setAttrib(selectedNode,"class",'r_entity r_'+entity_type.toLowerCase());
				if(countWords(nodeContent)<6)
					selectedNode.innerHTML="<span class='r_prop r_name' property='schema:name'>"+nodeContent+"</span>";
			}
		}else{
			// console.log('add new span');
			var temp = ' class="r_entity r_'+entity_type.toLowerCase()+'" typeof="schema:'+entity_type+'"';
			if(uri){
				temp=temp+' resource="'+uri+'"';
			}
			if(has_rel){
				temp=temp+' property="schema:'+has_rel+'"';
			}
			var annotatedContent;
			if(countWords(selectedContent)<6){
				annotatedContent = "<span" + temp + "><span class='r_prop r_name' property='schema:name'>" + selectedContent
				+ "</span></span>";
			}else{
				annotatedContent = "<span" + temp + ">" + selectedContent
				+ "</span>";
			}
			editor.selection.setContent(annotatedContent);
			//editor.execCommand('mceInsertRawHTML', false,annotatedContent);
		}
		// add namespaces
		var ns =editor.dom.get('namespaces');
		var nsStart;
		var nsEnd;		
		if(ns){
			txt=ns.innerHTML;
			nsStart = "";
			nsEnd="";
		}else{
			nsStart = "<div id='namespaces' prefix='schema: http://schema.org/'>";
			nsEnd="</div>";
		}	
		jQuery(editor.getBody()).html(nsStart+jQuery(editor.getBody()).html()+nsEnd);
	}else{
		if(tmp.length){
			if(tmp.length>1){
				//console.log('add new div');
				var temp = ' class="r_entity r_'+entity_type.toLowerCase()+'" itemscope itemtype="http://schema.org/'+entity_type+'"';
				if(uri){
					temp=temp+' itemid="'+uri+'"';
				}
				if(has_rel){
					temp=temp+' itemscope itemprop="'+has_rel+'"';
				}
				var annotatedContent;
				annotatedContent = "<div" + temp + ">" + selectedContent
				+ "</div>";
				editor.selection.setContent(annotatedContent);
				//editor.execCommand('mceInsertRawHTML', false,annotatedContent);
			}else{
				//console.log('update selected content');
				editor.dom.setAttrib(selectedNode,"itemtype",'http://schema.org/'+entity_type);
				if(uri){
					editor.dom.setAttrib(selectedNode,"itemid",uri);
				}
				if(has_rel){
					editor.dom.setAttrib(selectedNode,"itemprop",has_rel);
					editor.dom.setAttrib(selectedNode,"itemscope",' ');
				}
				//find a way to not delete the existing classes but update them
				editor.dom.setAttrib(selectedNode,"class",'r_entity r_'+entity_type.toLowerCase());
				if(countWords(nodeContent)<6)
					selectedNode.innerHTML="<span class='r_prop r_name' itemprop='name'>"+nodeContent+"</span>";
			}
		}else{
			//console.log('add new span');
			var temp = ' class="r_entity r_'+entity_type.toLowerCase()+'" itemscope itemtype="http://schema.org/'+entity_type+'"';
			if(uri){
				temp=temp+' itemid="'+uri+'"';
			}
			if(has_rel){
				temp=temp+' itemscope itemprop="'+has_rel+'"';
			}
			var annotatedContent;
			if(countWords(selectedContent)<6){
				annotatedContent = "<span" + temp + "><span class='r_prop r_name' itemprop='name'>" + selectedContent
				+ "</span></span>";
			}else{
				annotatedContent = "<span" + temp + ">" + selectedContent
				+ "</span>";
			}
			editor.selection.setContent(annotatedContent);
			//editor.execCommand('mceInsertRawHTML', false,annotatedContent);
		}
		jQuery(editor.getBody()).html(jQuery(editor.getBody()).html());
		//editor.setContent(jQuery(editor.getBody()).html());
	}
	editor.nodeChanged();
}
// Insert related attributes to HTML DOM tree
function insert_property(editor,property,b){
	var selectedContent = editor.selection.getContent();
	if(!selectedContent){
		alert('Please select some text first!');
		return null;
	}
	var selectedContentText=editor.selection.getContent({format : 'text'})
	var selectedNode = editor.selection.getNode();
	var nodeContent = selectedNode.innerHTML;
	// remove tinymce redundant data-mcs-href attribute
	nodeContent = nodeContent.replace(/\s(data-mce-href=)".*?"/g, "");
	nodeContent = nodeContent.replace(/\s(xmlns=)".*?"/g, "");

	// Annotation methods
	// if there is no need to add new tag
	if(jQuery.cookie("annotationF")=="RDFa"){
		if ((selectedContent == nodeContent) || (selectedContentText==jQuery(selectedContent).html())) {
			editor.dom.setAttrib(selectedNode,"property",'schema:'+property);
			editor.dom.setAttrib(selectedNode,"class",'r_prop r_'+property.toLowerCase());
		} else {
			// we need to add a new neutral html tag which involves
			// our annotation attributes
			// to do this we also need to check whether there is a paragraph or
			// not (to use DIV or SPAN)
			var temp = ' class="r_prop r_'+property.toLowerCase()+'" property="schema:'+property+'"';

			var annotatedContent = "<span" + temp + ">" + selectedContent
			+ "</span>";
			if ((editor.selection.getRng().startContainer.data != editor.selection
					.getRng().endContainer.data)
					|| editor.selection.getRng().commonAncestorContainer.nodeName == "BODY") {
				annotatedContent = "<div" + temp + ">" + selectedContent
				+ "</div>";
			}
			editor.selection.setContent(annotatedContent);
			//editor.execCommand('mceInsertContent', false, annotatedContent);
			//editor.execCommand('mceInsertRawHTML', false,annotatedContent);
		}
		jQuery(editor.getBody()).html(jQuery(editor.getBody()).html());
	}else{
		if ((selectedContent == nodeContent) || (selectedContentText==jQuery(selectedContent).html())) {
			editor.dom.setAttrib(selectedNode,"itemprop",property);
			editor.dom.setAttrib(selectedNode,"class",'r_prop r_'+property.toLowerCase());
		} else {
			// we need to add a new neutral html tag which involves
			// our annotation attributes
			// to do this we also need to check whether there is a paragraph or
			// not (to use DIV or SPAN)
			var temp = ' class="r_prop r_'+property.toLowerCase()+'" itemprop="'+property+'"';
			var annotatedContent = "<span" + temp + ">" + selectedContent
			+ "</span>";
			if ((editor.selection.getRng().startContainer.data != editor.selection
					.getRng().endContainer.data)
					|| editor.selection.getRng().commonAncestorContainer.nodeName == "BODY") {
				annotatedContent = "<div" + temp + ">" + selectedContent
				+ "</div>";
			}
			editor.selection.setContent(annotatedContent);
			//editor.execCommand('mceInsertRawHTML', false,annotatedContent);
		}
		jQuery(editor.getBody()).html(jQuery(editor.getBody()).html());
	}
	editor.nodeChanged();
}
var matched,browser;
jQuery.uaMatch=function(u){
	u=u.toLowerCase();
	var match=/(chrome)[ \/]([\w.]+)/.exec( u )||
	/(webkit)[ \/]([\w.]+)/.exec( u ) ||
	/(opera)(?:.*version|)[ \/]([\w.]+)/.exec( u ) ||
	/(msie) ([\w.]+)/.exec( u ) ||
	u.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec(u)||[];	
	return{browser:match[1]||"",version:match[2]||"0"}
};
matched=jQuery.uaMatch( navigator.userAgent );
browser={};
if(matched.browser){
	browser[matched.browser]=true;
	browser.version=matched.version
}
if(browser.chrome){
	browser.webkit=true
}
else if(browser.webkit){
	browser.safari=true
}
jQuery.browser=browser;
// show or hide selected entities
function show_entities(editor,c){
	if(c=='none'){
		jQuery.each(jQuery(editor.getDoc()).find('.r_entity'), function(index, value) { 
			if(jQuery.browser.webkit == true){
				// Problem with Chrome: removing background color doesn't work!
				jQuery(this).css('background-color','#fff');
			}else{
				jQuery(this).css('background','none');
			}
			jQuery(this).removeClass('r_entity').addClass('r_entity_h');		
		});		
		jQuery.each(jQuery(editor.getDoc()).find('.r_prop'), function(index, value) { 
			if(jQuery.browser.webkit == true){
				// Problem with Chrome: removing background color doesn't work!
				jQuery(this).css('background-color','#fff');
			}else{
				jQuery(this).css('background','none');
			}
			jQuery(this).removeClass('r_prop').addClass('r_prop_h');		
		});
	}else if(c=='all'){
		jQuery.each(jQuery(editor.getDoc()).find('.r_entity_h'), function(index, value) {
			jQuery(this).removeClass('r_entity_h').addClass('r_entity').removeAttr("style");		
		});		
		jQuery.each(jQuery(editor.getDoc()).find('.r_prop_h'), function(index, value) {
			jQuery(this).removeClass('r_prop_h').addClass('r_prop').removeAttr("style");		
		});	
	}else{
	// split the selected types
	}
	jQuery(editor.getBody()).html(jQuery(editor.getBody()).html());
}
function remove_annotation(pointer,format){
		pointer.find('.tooltip').remove();
		pointer.find('.tooltip-t').remove();
	if(format=="RDFa"){
		pointer.css("background-color","");
		pointer.removeAttr("typeof").removeAttr("class").removeAttr("resource").removeAttr("property");
		pointer.find('>[property]').each(function(i,v){
			remove_annotation(jQuery(v),'RDFa')
		});
	}else{
		pointer.css("background-color","");
		pointer.removeAttr("itemtype").removeAttr("class").removeAttr("itemid").removeAttr("itemscope").removeAttr("itemprop");
		pointer.find('>[itemprop]').each(function(i,v){
			remove_annotation(jQuery(v),'Microdata')
		});	
	}
	// remove spans wich have no attribute
	pointer.find('span').each(function(i,v){
		if(!jQuery(v)[0].attributes.length){
			// jQuery(v).unwrap();
			jQuery(v).replaceWith(jQuery(v).html());
		}
	});
	// remove pointer tags as well if necessary
	//var tagName=pointer.prop("tagName").toLowerCase();
	if(pointer.is('span') && !jQuery(pointer)[0].attributes.length){
		// pointer.unwrap();
		pointer.replaceWith(pointer.html());
	}
}
function remove_annotations(editor,only_automatic){
	var tmp;
	var aF=jQuery.cookie("annotationF");
		jQuery(editor.getDoc()).find('.tooltip').remove();
		jQuery(editor.getDoc()).find('.tooltip-t').remove();
		if(only_automatic){
			jQuery(editor.getDoc()).find('.automatic').each(function(i,v){
				remove_annotation(jQuery(v),aF);
			});	
		}else{
			jQuery(editor.getDoc()).find('.r_entity').each(function(i,v){
				remove_annotation(jQuery(v),aF);
			});		
		}
		// remove namespaces as well
		var ns=editor.dom.get('namespaces');
		if(ns){
			editor.setContent(ns.innerHTML);
		}
		//console.log(editor.getContent());
}
// creates random light colors
function get_random_color() {
    var letters = 'ABCDE'.split('');
    var color = '#';
    for (var i=0; i<3; i++ ) {
        color += letters[Math.floor(Math.random() * letters.length)];
    }
    return color;
}
function setCookie(c_name,value,exdays)
{
	jQuery.cookie(c_name, value, { expires: exdays, path: '/' });
}