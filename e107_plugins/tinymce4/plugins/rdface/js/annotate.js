var parentWin = (!window.frameElement && window.dialogArguments) || opener
		|| parent || top;
var plugin_url = parentWin.rdface_plugin_url;
var annotationF = parentWin.rdface_annotationF;
var editor = parentWin.rdface_editor;
var entities = new Array();
// gets a prefix and returns all the types related to that prefix
function getPrefixTypeFromList(prefix, types) {
	var tmp = types.split(",");
	var c = 0;
	var tmp2;
	var output = [];
	$.each(tmp, function(i, v) {
		tmp2 = v.split(':');
		if (tmp2[0].toLowerCase() == prefix.toLowerCase()) {
			c++;
			if (typeof tmp2[2] !== "undefined") {
        output.push(tmp2[2]+':'+tmp2[1]);
			}else{
        output.push(tmp2[1]);
      }
		}
	})
	if (!c) {
		// not found
		output = 0;
	}
	return output;
}
function mapDBpediaOutputToStandard(txt, proxy_url, recEntities,
		recEntitiesLevels) {
	var dataReceived;
  var txtE = txt.replace(/<br\s*[\/]?>/gi, "RetChar");
	var dataEnc = encodeURIComponent($(txtE).text());
	//console.log(data);
	if (!$.cookie("confidence")) {
		data = "api=DBpedia&confidence=0.50";
	} else {
		data = "api=DBpedia&confidence=" + $.cookie("confidence");
	}
	if (!$.cookie("language")) {
		data += "&language=fr&query=" + dataEnc;
	} else {
		data += "&language=" + $.cookie("language") + "&query=" + dataEnc;
	}
	dataReceived = connectEnricherAPI(proxy_url, data);
	//console.log(dataReceived);
	// terminate if an error occured
	if (!dataReceived)
		return 0;
	if (typeof dataReceived['Resources'] !== 'undefined') {
    $.each(dataReceived['Resources'], function(key, val) {
      // verification that the entity or part of the entity is not already defined
      var exist = false;
      var tst = $(txtE).text().substring(parseInt(val['@offset']), (parseInt(val['@offset']) + val['@surfaceForm'].length));
      if (entities.length) {
        for (e = 0; e < entities.length; e++) {
          //if (entities[e]['exact'] == $(txtE).text().substring(parseInt(val['@offset']), (parseInt(val['@offset']) + val['@surfaceForm'].length))) {exist = true; break;}
          var def = entities[e]['exact'];
          tst = $(txtE).text().substring(parseInt(val['@offset']), (parseInt(val['@offset']) + val['@surfaceForm'].length));
          //console.log(tst);
          if ((def.indexOf(tst) != -1) || (tst.indexOf(def) != -1)) {exist = true; break;}
        }
      }
      if (!exist) {
        var entity = new Array();
        var properties = new Array();
        var tmp = "";
        // separate desired entities
        if (val['@types'] != "") {
          var typ = val['@types'];
          if (typ.indexOf(",") != -1) {
            var typTab = typ.split(",");
            typTab.forEach(function(element) {
              if (element.indexOf("Schema") != -1) {tmp += element+":Schema,";}
              if (element.indexOf("DBpedia") != -1) {var elt2 = element.replace("DBpedia:","Schema:"); tmp += elt2+":dbPedia,";}
              if (element.indexOf("Wikidata") != -1) {var elt2 = element.replace("Wikidata:","Schema:"); tmp += elt2+":wikiData,";}
            });
          }else{
            if (typ.indexOf("Schema") != -1) {tmp = "Schema:"+val['@types']+":Schema";}
            if (typ.indexOf("DBpedia") != -1) {tmp = "Schema:"+val['@types']+":dbPedia";}
            if (typ.indexOf("Wikidata") != -1) {tmp = "Schema:"+val['@types']+":wikiData";}
          }
        }else{
          if (val['@URI'] != "") {
            var quoi = val['@URI'];
            if (quoi.indexOf("dbpedia") != -1) {tmp = "Schema:"+val['@surfaceForm']+":dbPedia";}
            if (quoi.indexOf("wikidata") != -1) {tmp = "Schema:"+val['@surfaceForm']+":wikiData";}
          }
        }
        var detectedTypes = getPrefixTypeFromList('schema', tmp);
        if (detectedTypes.length) {
          var tmp2 = 0;
          $.each(detectedTypes, function(i, tmp3) {
            // choose the most suitable type for the entity
            var tp = tmp3.split(":");
            //schema
            if (tp[0] == "Schema") {
              if ((recEntities.indexOf(tp[1]) != -1)
                  && (recEntitiesLevels[recEntities.indexOf(tp[1])] > tmp2)) {
                entity["type"] = 'schema:' + tp[1];
                entity["sch"] = "ok";
              }
              tmp2 = recEntitiesLevels[recEntities.indexOf(tp[1])];
            }
            //dbpedia
            if (tp[0] == "dbPedia" && entity['sch'] != "ok") {
              entity["type"] = 'schema:APIReference';
            }
            //wikidata
            if (tp[0] == "wikiData" && entity['sch'] != "ok") {
              entity["type"] = 'schema:APIReference';
            }
          })
          entity["label"] = val['@surfaceForm'];
          entity["uri"] = val['@URI'];
          // add a property
          entity["start"] = parseInt(val['@offset']);
          entity["end"] = parseInt(val['@offset'])
              + val['@surfaceForm'].length;
          entity["length"] = parseInt(entity["end"] - entity["start"]);
          entity["exact"] = $(txtE).text().substring(entity["start"], entity["end"]);
          if (entity["type"]) {
            entities.push(entity);
          }
        //console.log(entity);
        }
      }
    });
  }
	return entities;
}
function mapEventRegistryOutputToStandard(txt, proxy_url, recEntities,
		recEntitiesLevels) {
  //console.log(txt);
	var dataReceived;
  var txtE = txt.replace(/<br\s*[\/]?>/gi, "RetChar");
	var dataEnc = encodeURIComponent($(txtE).text());
	//console.log(data);
	if (!$.cookie("confidence")) {
		data = "api=EventRegistry&confidence=0.50";
	} else {
		data = "api=EventRegistry&confidence=" + $.cookie("confidence");
	}
	if (!$.cookie("language")) {
		data += "&language=fr&query=" + dataEnc;
	} else {
		data += "&language=" + $.cookie("language") + "&query=" + dataEnc;
	}
	dataReceived = connectEnricherAPI(proxy_url, data);
	//console.log(dataReceived);
	// terminate if an error occured
	if (!dataReceived)
		return false;
  var cpt = 0;
  if (typeof dataReceived['annotations'] !== 'undefined') {
    $.each(dataReceived['annotations'], function(key, val) {
      // verification that the entity or part of the entity is not already defined
      var exist = false;
      if (entities.length) {
        for (e = 0; e < entities.length; e++) {
          var def = entities[e]['exact'];
          var tst = val['support'][0]['text'];
          if ((def.indexOf(tst) != -1) || (tst.indexOf(def) != -1)) {exist = true; break;}
        }
      }
      if (!exist) {
        var entity = new Array();
        var properties = new Array();
        // separate desired entities
        var tmp = "";
        if (val['type'] != "") {
          var GType = val['type'];
          if (val['type'] == "org") {GType = "Organization";}
          if (val['type'] == "loc") {GType = "Place";}
          if (val['type'] == "person") {GType = "Person";}
          tmp += "Schema:"+GType+':Schema,';
        }
        //console.log(val['dbPediaTypes']);
        val['dbPediaTypes'].forEach(function(element) {
          tmp += "Schema:"+element+':dbPedia,';
        });
        val['wikiDataClasses'].forEach(function(elmt) {
          Object.keys(elmt).map(function(objectKey, index) {
            tmp += "Schema:"+elmt['enLabel']+':wikiData,';
          });
        });   
        //console.log(tmp);
        var detectedTypes = getPrefixTypeFromList('schema', tmp);
        if (detectedTypes.length) {
          //console.log(detectedTypes);
          var tmp2 = 0;
          $.each(detectedTypes, function(i, tmp3) {
            // choose the most suitable type for the entity
            var tp = tmp3.split(":");
            //schema
            if (tp[0] == "Schema") {
              if ((recEntities.indexOf(tp[1]) != -1)
                  && (recEntitiesLevels[recEntities.indexOf(tp[1])] > tmp2)) {
                entity["type"] = 'schema:' + tp[1];
                entity["uri"] = val['url'];
                entity["sch"] = "ok";
              }
              tmp2 = recEntitiesLevels[recEntities.indexOf(tp[1])];
            }
            //dbpedia
            if (tp[0] == "dbPedia" && entity['sch'] != "ok") {
              entity["type"] = 'schema:APIReference';
              entity["uri"] = val['dbPediaIri'];
            }
            //wikidata
            if (tp[0] == "wikiData" && entity['sch'] != "ok") {
              entity["type"] = 'schema:APIReference';
              entity["uri"] = val['url'];
            }
          });
          entity["label"] = val['title'];
          entity["start"] = parseInt(val['support'][0]['chFrom']);
          entity["end"] = parseInt(val['support'][0]['chTo'])+1;
          entity["length"] = parseInt(entity["end"] - entity["start"]);
          // add a property
          entity["exact"] = val['support'][0]['text'];
          if (entity["type"]) {
            entities.push(entity);
            cpt += 1;
          }
          //console.log(entity);
        }
      }
    });
  }
	//console.log(entities);
	return entities;
}
function mapMeaningCloudOutputToStandard(txt, proxy_url, recEntities,
		recEntitiesLevels) {
	var dataReceived;
	var txtE = txt.replace(/<br\s*[\/]?>/gi, "RetChar");
	var dataEnc = encodeURIComponent($(txtE).text());
	//console.log(data);
	if (!$.cookie("confidence")) {
		data = "api=MeaningCloud&confidence=0.50";
	} else {
		data = "api=MeaningCloud&confidence=" + $.cookie("confidence");
	}
	if (!$.cookie("language")) {
		data += "&language=fr&query=" + dataEnc;
	} else {
		data += "&language=" + $.cookie("language") + "&query=" + dataEnc;
	}
	dataReceived = connectEnricherAPI(proxy_url, data);
	//console.log(dataReceived);
	// terminate if an error occured
	if (!dataReceived)
		return 0;
	if (typeof dataReceived['entity_list'] !== 'undefined') {
    $.each(dataReceived['entity_list'], function(key, val) {
      // verification that the entity or part of the entity is not already defined
      var exist = false;
      if (entities.length) {
        for (e = 0; e < entities.length; e++) {
          var def = entities[e]['exact'];
          var tst = val['variant_list'][0]['form'];
          if ((def.indexOf(tst) != -1) || (tst.indexOf(def) != -1)) {exist = true; break;}
        }
      }
      if (!exist) {
        var entity = new Array();
        var properties = new Array();
        // separate desired entities
        var tmp = "";
        var tabtmp = val['sementity']['type'].split(">");
        //console.log(tabtmp);
        tabtmp.forEach(function(element) {
          if (element != "Top") {tmp += "Schema:"+element+',';}
        });
        //console.log(tmp);
        var detectedTypes = getPrefixTypeFromList('schema', tmp);
        if (detectedTypes.length) {
          var tmp = 0;
          // choose the most suitable type for the entity
          $.each(detectedTypes, function(i, tp) {
            if ((recEntities.indexOf(tp) != -1)
                && (recEntitiesLevels[recEntities.indexOf(tp)] > tmp)) {
              entity["type"] = 'schema:' + tp;
            }
            tmp = recEntitiesLevels[recEntities.indexOf(tp)];
          })
          entity["label"] = val['form'];
          // add a property
          entity["start"] = parseInt(val['variant_list'][0]['inip']);
          entity["end"] = parseInt(val['variant_list'][0]['endp'])+1;
          entity["length"] = parseInt(entity["end"] - entity["start"]);
          entity["exact"] = val['variant_list'][0]['form'];
          //entity["exact"] = $(txtE).text().substring(entity["start"], entity["end"]);
          if (entity["type"]) {
            entities.push(entity);
          }
        }
      }
    });
  }
	//console.log(entities);
	return entities;
}
function mapDandelionOutputToStandard(txt, proxy_url, recEntities,
		recEntitiesLevels) {
	var dataReceived;
	var txtE = txt.replace(/<br\s*[\/]?>/gi, "RetChar");
	var dataE = data;
	var dataEnc = encodeURIComponent($(txtE).text());
	//console.log(data);
	if (!$.cookie("confidence")) {
		data = "api=Dandelion&confidence=0.50";
	} else {
		data = "api=Dandelion&confidence=" + $.cookie("confidence");
	}
	if (!$.cookie("language")) {
		data += "&language=fr&query=" + dataEnc;
	} else {
		data += "&language=" + $.cookie("language") + "&query=" + dataEnc;
	}
	dataReceived = connectEnricherAPI(proxy_url, data);
	//console.log(dataReceived);
	// terminate if an error occured
	if (!dataReceived)
		return 0;
  if (typeof dataReceived['annotations'] !== 'undefined') {
    $.each(dataReceived['annotations'], function(key, val) {
      var exist = false;
      //exclude when inside html(img) tags
      if (data.indexOf("%5Bimg") != -1) {
        var pos1 = dataE.indexOf("%5Bimg");
        var pos2 = dataE.indexOf("img%5D") + 6;
        if (val['start'] >= pos1 && val['start'] <= pos2) {exist = true;}
      }
      // verification that the entity or part of the entity is not already defined
      if (entities.length) {
        for (e = 0; e < entities.length; e++) {
          var def = entities[e]['exact'];
          var tst = val['spot'];
          if ((def.indexOf(tst) != -1) || (tst.indexOf(def) != -1)) {exist = true; break;}
        }
      }
      if (!exist) {
        var entity = new Array();
        var properties = new Array();
        // separate desired entities
        var tmp = "";
        var tabtmp = val['types'];
        //schema
        if (tabtmp != "") {
          tabtmp.forEach(function(element) {
            var tabelt = element.split("/");
            var eltsch = tabelt[tabelt.length - 1];
            tmp += "Schema:"+eltsch+',';
          });
          //console.log(tmp);
          var detectedTypes = getPrefixTypeFromList('schema', tmp);
          //console.log(detectedTypes);
          if (detectedTypes.length) {
            var tmp = 0;
            // choose the most suitable type for the entity
            $.each(detectedTypes, function(i, tp) {
              if ((recEntities.indexOf(tp) != -1)
                  && (recEntitiesLevels[recEntities.indexOf(tp)] > tmp)) {
                entity["type"] = 'schema:' + tp;
                entity["sch"] = "ok";
                //console.log(entity["type"]);
              }
              tmp = recEntitiesLevels[recEntities.indexOf(tp)];
            })
          }
        }else{
          var lod = val['lod'];
          $.each(lod, function(i, tp) {
            if (tp.indexOf("dbpedia") != -1) {//dbPedia > prioritaire
              entity["type"] = 'schema:APIReference';
              entity["uri"] = tp;
              entity["dbp"] = "ok";
            }
            if (tp.indexOf("wikipedia") != -1 && entity["dbp"] != "ok") {//wikipedia
              entity["type"] = 'schema:APIReference';
              entity["uri"] = tp;
            }
          });
        }
        entity["label"] = val['label'];
        entity["description"] = val['abstract'];
        // add a property
        entity["uri"] = val['uri'];
        entity["start"] = val['start'];
        entity["end"] = val['end'];
        entity["exact"] = val['spot'];
        if (entity["type"]) {
          entities.push(entity);
        }
      }
    });
  }
	//console.log(entities);
	return entities;
}
//console.log(entities);
function remove_annotations(editor, only_automatic) {
	var tmp;
	var aF = $.cookie("annotationF");
	//console.log($(editor.getDoc()));
	$(editor.getDoc()).find('.tooltip').remove();
	$(editor.getDoc()).find('.tooltip-t').remove();
	if (only_automatic) {
		$(editor.getDoc()).find('.automatic').each(function(i, v) {
			remove_annotation($(v), aF);
		});
	} else {
		$(editor.getDoc()).find('.r_entity').each(function(i, v) {
			remove_annotation($(v), aF);
		});
	}
	// remove namespaces as well
	var ns = editor.dom.get('namespaces');
	if (ns) {
		editor.setContent(ns.innerHTML);
	}
}
function sortDESC(a, b) {
	return (b - a);
}
function enrichText(entities, editor) {
	// handle overwriting of triples
	// get the list of existing annotated entities and add them to block arr to
	// prevent overwriting them
	var notOverwrite = new Array();
	$.each($(editor.getDoc()).find('.r_entity'), function(index, value) {
		if (!$(this).hasClass("automatic")) {
			notOverwrite.push($(this).text().trim());
		}
	});
	// -----------------------------
	var output = new Array();
	var enriched_text_p = editor.getContent();
  var txtE = enriched_text_p.replace(/<br\s*[\/]?>/gi, "RetChar");
	var enriched_text = $(txtE).text();
	//console.log('Toto : '+enriched_text);
	var extra_triples = '';
	// prepare positioning functions
	var sortArr = new Array();
	var nosortArr = new Array();
	$.each(entities, function(key, val) {
		nosortArr.push(val['start']);
	});
	$.each(nosortArr, function(ii, vv) {
		sortArr.push(vv);
	});
	sortArr.sort(sortDESC);
	var entitiesFinal = new Array();
	$.each(sortArr, function(i, v) {
		$.each(nosortArr, function(ii, vv) {
			if (vv == v) {
				var entityExtend = new Array();
				entityExtend["start"] = entities[ii]["start"];
				entityExtend["end"] = entities[ii]["end"];
				entityExtend["exact"] = entities[ii]["exact"];
				entityExtend["properties"] = entities[ii]["properties"];
				entityExtend["label"] = entities[ii]["label"];
				entityExtend["type"] = entities[ii]['type'];
				entityExtend["uri"] = entities[ii]['uri'];
				entitiesFinal.push(entityExtend);
			}
		});
	});
	entities = entitiesFinal;
	// replace the entities
	$.each(entities, function(key, val) {
		var selectedContent = val['label'];
		var start = val['start'];
		var end = val['end'];
		var selectedContent = val['exact'];
		if (notOverwrite.indexOf(selectedContent) == -1) {
			var subjectURI = '';
			if (val['uri']) {
				subjectURI = val['uri'];
			}
			var tmp2 = '';
			var annotatedContent, extra_triples;
			extra_triples = '';
			// different replacement for RDFa and Microdata
			var entity_type = val['type'].split(':')[1];
			var entity_type_cl = 'r_' + entity_type.toLowerCase();
			if ($.cookie("annotationF") == "RDFa") {
				// replacement for RDFa
				if (subjectURI) {
					tmp2 = "resource=" + subjectURI;
				}
				var temp = tmp2 + " typeof='" + val['type'] + "'";
				annotatedContent = "<span class='r_entity " + entity_type_cl
						+ " automatic' " + temp + ">";
				extra_triples = extra_triples + "<span class='r_prop r_name' property='schema:name'>"
						+ selectedContent + "</span>";
			} else {
				// replacement for Micodata Schema.org format
				if (subjectURI) {
					tmp2 = "itemid=" + subjectURI;
				}
				var temp = tmp2 + " itemtype='http://schema.org/" + entity_type
						+ "'";
				annotatedContent = "<span itemscope class='r_entity "
						+ entity_type_cl + " automatic' " + temp + ">";
				extra_triples = extra_triples + "<span class='r_prop r_name' itemprop='name'>"
						+ selectedContent + "</span>";
			}
			annotatedContent = annotatedContent + extra_triples + "</span>";
			enriched_text = enriched_text.substring(0, start)
					+ annotatedContent
					+ enriched_text.substring(end, enriched_text.length + 1);
		}
	});
	//console.log(enriched_text);
  var txtD = enriched_text.replace(/RetChar/g, "<br />");
	return txtD;
}
var Annotate = {
	init : function() {
		var recEntities = new Array();
		var recEntitiesLevels = new Array();
		if (!$.cookie("recEntities")) {
			var schemas;
			$.ajax({
				url : plugin_url + '/schema_creator/selection.json',
				dataType : 'json',
				async : false,
				success : function(data) {
					schemas = data;
				}
			});
			$.each(schemas['types'], function(i, v) {
				recEntities.push(i);
				recEntitiesLevels.push(v['level']);
			})
			setCookie("recEntities", recEntities.join(), 30);
			setCookie("recEntitiesLevels", recEntitiesLevels.join(), 30);
		} else {
			recEntities = $.cookie("recEntities").split(",");
			recEntitiesLevels = $.cookie("recEntitiesLevels").split(",");
		}
		// first we need to remove automatically generated annotations
		remove_annotations(editor, 1);
		var ns =editor.dom.get('namespaces');
		var txt;
		if(ns){
			txt=ns.innerHTML;
		}else{
			txt=editor.getContent();
		}
		var nsStart = "<div id='namespaces' prefix='schema: http://schema.org/'>";
		var nsEnd="</div>";
		
		//DBpedia
		var entities = mapDBpediaOutputToStandard(txt,
				proxy_url, recEntities, recEntitiesLevels);
		
		
		//EventRegistry
		var entities = mapEventRegistryOutputToStandard(txt,
				proxy_url, recEntities, recEntitiesLevels);
		
			
		//MeaningCloud
		var entities = mapMeaningCloudOutputToStandard(txt,
				proxy_url, recEntities, recEntitiesLevels);
		
		
		//Dandelion
		var entities = mapDandelionOutputToStandard(txt,
				proxy_url, recEntities, recEntitiesLevels);
		
		// enrich the text
		var enriched_text = enrichText(entities, editor);
		// -------------------------------------------------
		if ($.cookie("annotationF") == "RDFa") {
			editor.setContent(nsStart+enriched_text+nsEnd);
		} else {
			editor.setContent(enriched_text);
		}
		editor.nodeChanged();
		// -------------------------------------------------
		editor.windowManager.close();
	}
};


