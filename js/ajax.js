/* ========================================
 * @project = Linked Data Geovisualizer
 * @author = Grant McKenzie
 * @contact = grant.mckenzie@geog.ucsb.edu
 * @date = October, 2014
 * @lab = http://stko.geog.ucsb.edu
 ++++++++++++++++++++++++++++++++++++++++++++
 * Modified by Bo Yan, boyan@geog.ucsb.edu
 * website: http://geog.ucsb.edu/~boyan
 * Last modifed on 10/15/2015
 * ======================================== */
 var stkoData;


  // Load the Classes and SubClasses from the given data
  _STKO.loadClasses = function() {
     $('#doQuery').html("<img src='img/loading.gif'/>");
     this.endpoints.sparql = $('#sparql').val();
     this.endpoints.graph = $('#graph').val();
     this.endpoints.baseclass = $('#ont').val();
     this.params.format = "application/sparql-results+json";
     this.params.limit = 100;
     //this.query.loadClasses = "select ?child ?parent (count(?b) as ?count) where {?child rdfs:subClassOf <" + this.endpoints.baseclass + "> option(transitive) . ?child rdfs:subClassOf ?parent . ?b a ?child} group by ?child ?parent";
     

     // this.query.loadClasses = "select ?child ?parent (0) as ?count where {?child rdfs:subClassOf <" + this.endpoints.baseclass + "> option(transitive) . ?child rdfs:subClassOf ?parent} group by ?child ?parent";
     // notice the "+" after rdfs:subClassOf
     this.query.loadClasses = "select ?child ?parent ((0) as ?count) where {?child rdfs:subClassOf+ <" + this.endpoints.baseclass + "> . ?child rdfs:subClassOf ?parent. } group by ?child ?parent";

      // var url = this.endpoints.sparql + "?default-graph-uri=" + encodeURIComponent(this.endpoints.graph) + "&query=" + encodeURIComponent(this.prefixes.rdfs + " " + this.query.loadClasses + " order by ?child") + "&format=" + encodeURIComponent(this.params.format) + "&timeout=3000&debug=on";
      
      // Graphdb does not use any default graph in this case
      var url = this.endpoints.sparql + "?query=" + encodeURIComponent(this.prefixes.rdfs + " " + this.query.loadClasses + " order by ?child") + "&Accept=" + encodeURIComponent(this.params.format) + "&timeout=3000&debug=on&infer=false";
      
      
      $.ajax({
	    url: url,
	    type:'GET',
	    dataType: 'json',
      // headers: {Connection: close},
	    success: function(data, textStatus, xhr) {
		//console.log("success");
		//console.log(data.results.bindings);
		_STKO.display.loadClasses(data.results.bindings);
		$('#doQuery').html("QUERY");
	    },
	    error: function(xhr, textStatus, errorThrown) {
		//console.log(url);
		//console.log("error");
		//console.log(data.results.bindings)
		_UTILS.showModal("error", textStatus, 300, 100);
	    }
	});
  }
  
  // Load all the properties for the selected class

  // list all the properties in ADL, this has been done using this query:
  //select distinct ?prop WHERE {?a ?prop ?c . ?a a <http://adl-gazetteer.geog.ucsb.edu/ONT/ADL#places>}
  var adlPropObj = [
  	"http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
  	"http://www.w3.org/2000/01/rdf-schema#label",
  	"http://adl-gazetteer.geog.ucsb.edu/ONT/ADL#hasPrimaryName",
  	"http://www.geonames.org/ontology#parentFeature",
  	"http://adl-gazetteer.geog.ucsb.edu/ONT/ADL#hasAlternateName",
  	"http://adl-gazetteer.geog.ucsb.edu/ONT/ADL#hasDescription",
  	"http://adl-gazetteer.geog.ucsb.edu/ONT/ADL#hasEntryDate",
  	"http://adl-gazetteer.geog.ucsb.edu/ONT/ADL#hasModificationDate",
  	"http://adl-gazetteer.geog.ucsb.edu/ONT/ADL#hasSchema",
  	"http://adl-gazetteer.geog.ucsb.edu/ONT/ADL#onPlanet",
  	"http://www.w3.org/2003/01/geo/wgs84_pos#lat",
  	"http://www.w3.org/2003/01/geo/wgs84_pos#long",
  	// "http://adl-gazetteer.geog.ucsb.edu/ONT/ADL#centerLongitude",
  	// "http://adl-gazetteer.geog.ucsb.edu/ONT/ADL#centerLatitude",
  	"http://adl-gazetteer.geog.ucsb.edu/ONT/ADL#geomType",
  	"http://www.opengis.net/ont/geosparql#hasGeometry",
  	"http://adl-gazetteer.geog.ucsb.edu/ONT/ADL#elevation",
  	"http://adl-gazetteer.geog.ucsb.edu/ONT/ADL#supplementalNote",
  	"http://adl-gazetteer.geog.ucsb.edu/ONT/ADL#hasRelatedFeature",
  	"http://adl-gazetteer.geog.ucsb.edu/ONT/ADL#seismic_moment_magnitude",
  	"http://www.w3.org/2002/07/owl#sameAs",
  	"http://adl-gazetteer.geog.ucsb.edu/ONT/ADL#population",
  	"http://adl-gazetteer.geog.ucsb.edu/ONT/ADL#name",
  	"http://adl-gazetteer.geog.ucsb.edu/ONT/ADL#gaulcode",
  	"http://adl-gazetteer.geog.ucsb.edu/ONT/ADL#adminlevel",
  	"http://adl-gazetteer.geog.ucsb.edu/ONT/ADL#description"
  ];

  var dataProp = [];

  for (var i=0; i < adlPropObj.length; i++) {
    var temp = {prop: {type: 'uri', value: adlPropObj[i]}};
    dataProp.push(temp);
  }



  _STKO.loadProperties = function(oClass) {
     this.endpoints.baseClass = oClass;
                     _STKO.display.loadProperties(dataProp);
                     _STKO.loadCount();
     
      // var sparqlEndpoint = this.endpoints.sparql;
      // var prefixesRDFS = this.prefixes.rdfs;
      // var paramsFormat = this.params.format;



      // var propData = [];
      // function loopAdlPropObj(i) {
      //   var askQuery = "ask {?a <" + adlPropObj[i] + "> ?c . ?a a <" + oClass + ">}";
      //   var url = sparqlEndpoint + "?query=" + encodeURIComponent(prefixesRDFS + " " + askQuery) + "&Accept=" + encodeURIComponent(paramsFormat) + "&timeout=3000&debug=on&infer=true";
      //   if (i<adlPropObj.length) {
      //     i++;
      //   }
      //   else {
      //     i=0;
      //     return;
      //   }
      //     $.ajax({
      //       url: url,
      //       type: 'GET',
      //       dataType: 'json',
      //       success: function(data, textStatus, xhr) {
      //         if (data["boolean"]) {
      //           // console.log(data["boolean"]);
      //           temp = {prop: {type: 'uri', value: adlPropObj[i]}};
      //           propData.push(temp);
      //           loopAdlPropObj(i)
      //           // console.log(propData);
      //           if (i==adlPropObj.length-1) {
      //                _STKO.display.loadProperties(propData);
      //                _STKO.loadCount();

      //           }
      //         }
      //       },
      //       error: function(xhr, textStatus, errorThrown) {
      //         _UTILS.showModal("error", textStatus);
      //       }
      //     });

      // }

      // loopAdlPropObj(0);
    // console.log(propData);


          // console.log(adlPropObj[prop]);
      		// var askQuery = "ask {?a <" + adlPropObj[0] + "> ?c . ?a a <" + oClass + ">}";
        //   var url = this.endpoints.sparql + "?query=" + encodeURIComponent(this.prefixes.rdfs + " " + askQuery) + "&Accept=" + encodeURIComponent(this.params.format) + "&timeout=3000&debug=on&infer=true";
        //   var i = 0;





	// must have "group by"
      // this.query.loadProperties = "select ?prop (count(?prop) as ?count) WHERE {?a ?prop ?c . ?a a <" + oClass + ">} group by ?prop order by desc (?count)";
      
      // var url = this.endpoints.sparql + "?query=" + encodeURIComponent(this.prefixes.rdfs + " " + this.query.loadProperties) + "&Accept=" + encodeURIComponent(this.params.format) + "&timeout=3000&debug=on&infer=false";

 //      $.ajax({
	//     url: url,
	//     type: 'GET',
	//     dataType: 'json',
	//     success: function(data, textStatus, xhr) {
	// 	_STKO.display.loadProperties(data.results.bindings);
	// 	_STKO.loadCount();
	//     },
	//     error: function(xhr, textStatus, errorThrown) {
	// 	_UTILS.showModal("error", textStatus);
	//     }
	// });
    
  }
  
  // Load all entities based on the selected class and property criteria
  _STKO.loadEntities = function() {
      /* $('#doQueryEntities').html("<img src='img/loading.gif'/>");
      var filter = "";
      var property = "";
      var count = 0;
      for(var key in _STKO.params.restrictions) {
	  var filtertype = _STKO.params.restrictions[key][0][2];
	  property = key;
	  if (filtertype == "Literal (int" || filtertype == "Literal (flo" || filtertype == "Literal (dou") {
	    filter += " . ?a <"+key+"> ?b"+count+" . FILTER (";
	    for(var i=0;i<_STKO.params.restrictions[key].length;i++) {
		if (_STKO.params.restrictions[key][i][0] == "≠")
		    var asdf = "!=";
		else
		    var asdf = $("<div/>").html(_STKO.params.restrictions[key][i][0]).text();
		filter += "?b"+count+" " + asdf + " " + _STKO.params.restrictions[key][i][1] + " && ";
	    }
	    filter = filter.substr(0, filter.length-4);
	    filter += ")";
	  } else if (filtertype == "Literal (Str") {
	    filter += " . ?a <"+key+"> ?b"+count+" . FILTER (";
	    for(var i=0;i<_STKO.params.restrictions[key].length;i++) {
		if (_STKO.params.restrictions[key][i][0] == "≠") {
		    var asdf = "!=";
		    filter += "!regex(str(?b"+count+"),'"+_STKO.params.restrictions[key][i][1]+"','i') && ";
		} else {
		    var asdf = $("<div/>").html(_STKO.params.restrictions[key][i][0]).text();
		    filter += "regex(str(?b"+count+"),'"+_STKO.params.restrictions[key][i][1]+"','i') && ";
		}
	    }
	    filter = filter.substr(0, filter.length-4);
	    filter += ")";
	  }
	  count++;
      }
      
      var extent = " . ?a <http://adl-gazetteer.geog.ucsb.edu/ONT/ADL#centerLatitude> ?lat . ?a <http://adl-gazetteer.geog.ucsb.edu/ONT/ADL#centerLongitude> ?long . FILTER ( ?long > \""+Math.round(_MAP.map.getBounds().getWest()*100)/100+"\"^^xsd:float && ?long < \""+Math.round(_MAP.map.getBounds().getEast()*100)/100+"\"^^xsd:float && ?lat > \""+Math.round(_MAP.map.getBounds().getSouth()*100)/100+"\"^^xsd:float && ?lat < \""+Math.round(_MAP.map.getBounds().getNorth()*100)/100+"\"^^xsd:float)";
      
      this.query.loadEntities = "select ?a ?lat ?long where {?a a+ <"+this.endpoints.baseClass+"> "+filter+extent+"}";

      var url = this.endpoints.sparql + "?query=" + encodeURIComponent(this.prefixes.geo + " " + this.query.loadEntities) + "&Accept=" + encodeURIComponent(this.params.format) + "&timeout=3000&debug=on&infer=false"; */
    
      
 //      $.ajax({
	//     url: url,
	//     type: 'GET',
	//     dataType: 'json',
	//     success: function(data, textStatus, xhr) {
	// 	// _STKO.display.loadEntities(data.results.bindings);
	// 	_MAP.mapEntities(data.results.bindings);
	// 	// $('#doQueryEntities').html("ADD TO LAYERS");
	//     },
	//     error: function(xhr, textStatus, errorThrown) {
	// 	_UTILS.showModal("error", textStatus);
	//     }
	// }); 

	_MAP.mapEntities(stkoData.results.bindings);
	// console.log(stkoData);
  }
  
  // Load Details of a specific entity.  All properties and values
  _STKO.loadDetails = function(uri, id, graph, endpoint) {
      this.query.loadDetails = "select ?a ?b where {<" + uri + "> ?a ?b}";
      var url = endpoint + "?query=" + encodeURIComponent(this.query.loadDetails + " limit " + this.params.limit) + "&Accept=" + encodeURIComponent(this.params.format) + "&timeout=3000&debug=on&infer=false";
    
      $.ajax({
	    url: url,
	    urig: id,
	    type: 'GET',
	    dataType: 'json',
	    success: function(data, textStatus, xhr) {
		_MAP.displayPopup(data.results.bindings, this.urig);
	    },
	    error: function(xhr, textStatus, errorThrown) {
		_UTILS.showModal("error", textStatus);
	    }
	});
	
  }  
  
  _STKO.loadDateType = function(uri, id) {
      // $('#sub_'+id).html(uri);
    
      _UTILS.toggleProperty(id);
	  
      if ($('#'+id).hasClass('propertyon')) {
	// this.query.loadDateType = "select (str(datatype(?c)) as ?dt) (count(?c) as ?cnt) (max(?c) as ?max) (min(?c) as ?min) WHERE {?a <"+uri+"> ?c . ?a a <"+this.endpoints.baseClass+">} group by ?c order by desc(?cnt) limit 1";
	this.query.loadDateType = "select (str(datatype(?c)) as ?dt) WHERE {?a <"+uri+"> ?c . ?a a <"+this.endpoints.baseClass+">} limit 1";
	$('#loadingSide').show();
	
	var url = this.endpoints.sparql + "?query=" + encodeURIComponent(this.prefixes.geo + " " + this.query.loadDateType) + "&Accept=" + encodeURIComponent(this.params.format) + "&timeout=3000&debug=on&infer=false";
      
	
	$.ajax({
	      url: url,
	      type: 'GET',
	      dataType: 'json',
	      success: function(data, textStatus, xhr) {
		  $('#loadingSide').hide();

		if (data.results.bindings.length == 0) {
			$('#sub_'+id+'_').html("No such property for this class");
			$('#sub_'+id+'_').slideDown();
		} else {

		if (data.results.bindings[0].hasOwnProperty('dt')) {
		  var n = _UTILS.getname(data.results.bindings[0].dt.value, "#");
		  if (n.name != "string") 
		    // $('#sub_'+id+'_').html("Data Type: Literal ("+n.name + ")<br/>Value Range: "+data.results.bindings[0].max.value + " to "+data.results.bindings[0].min.value);
			$('#sub_'+id+'_').html("Data Type: Literal ("+n.name + ")");
		  else
		      $('#sub_'+id+'_').html("Data Type: Literal (String)");
		} else {
		    if (!data.results.bindings[0].hasOwnProperty('dt'))
		      $('#sub_'+id+'_').html("Data Type: URI");
		    else
		      $('#sub_'+id+'_').html("Data Type: Literal (String)");
		}
		$('#input_'+id+'_').slideDown();
		$('#equals_'+id+'_').slideDown();
		$('#sub_'+id+'_').slideDown();
	}
		

	      },
	      error: function(xhr, textStatus, errorThrown) {
		  _UTILS.showModal("error", textStatus);
	      }
	  }); 
      } else {
	  
	  $('#input_'+id+'_').slideUp();
	  $('#sub_'+id+'_').slideUp();
	  $('#equals_'+id+'_').slideUp();
      }
  }

  // _STKO.layers.layers = {};

    
  _STKO.loadCount = function() {
      if (!this.endpoints.baseClass)
	  return;
      
      $('#wrapperCount').html("<img src='img/loading-mini.gif'/>");
      var filter = "";
      var property = "";
      var count = 0;
      for(var key in _STKO.params.restrictions) {
	  var filtertype = _STKO.params.restrictions[key][0][2];
	  property = key;
	  if (filtertype == "Literal (int" || filtertype == "Literal (flo" || filtertype == "Literal (dou") {
	    filter += " . ?a <"+key+"> ?b"+count+" . FILTER (";
	    for(var i=0;i<_STKO.params.restrictions[key].length;i++) {
		if (_STKO.params.restrictions[key][i][0] == "≠")
		    var asdf = "!=";
		else
		    var asdf = $("<div/>").html(_STKO.params.restrictions[key][i][0]).text();
		filter += "?b"+count+" " + asdf + " " + _STKO.params.restrictions[key][i][1] + " && ";
	    }
	    filter = filter.substr(0, filter.length-4);
	    filter += ")";
	  } else if (filtertype == "Literal (Str") {
	    filter += " . ?a <"+key+"> ?b"+count+" . FILTER (";
	    for(var i=0;i<_STKO.params.restrictions[key].length;i++) {
		if (_STKO.params.restrictions[key][i][0] == "≠") {
		    var asdf = "!=";
		    filter += "!contains(?b"+count+",'"+_STKO.params.restrictions[key][i][1]+"') && ";
		} else {
		    var asdf = $("<div/>").html(_STKO.params.restrictions[key][i][0]).text();
		    filter += "contains(?b"+count+",'"+_STKO.params.restrictions[key][i][1]+"') && ";
		}
	    }
	    filter = filter.substr(0, filter.length-4);
	    filter += ")";
	  }
	  count++;
      }
      
      // var extent = " . ?a <http://adl-gazetteer.geog.ucsb.edu/ONT/ADL#centerLatitude> ?lat . ?a <http://adl-gazetteer.geog.ucsb.edu/ONT/ADL#centerLongitude> ?long . FILTER ( ?long > \""+Math.round(_MAP.map.getBounds().getWest()*100)/100+"\"^^xsd:float && ?long < \""+Math.round(_MAP.map.getBounds().getEast()*100)/100+"\"^^xsd:float && ?lat > \""+Math.round(_MAP.map.getBounds().getSouth()*100)/100+"\"^^xsd:float && ?lat < \""+Math.round(_MAP.map.getBounds().getNorth()*100)/100+"\"^^xsd:float)";
      var extent = "?a omgeo:within(" + Math.round(_MAP.map.getBounds().getSouth()*100)/100 + " " + Math.round(_MAP.map.getBounds().getWest()*100)/100 + " " + Math.round(_MAP.map.getBounds().getNorth()*100)/100 + " " + Math.round(_MAP.map.getBounds().getEast()*100)/100 + ") .";

      // limit the count to 5000
      // this.query.loadCount = "select ?a ?lat ?long WHERE {?a a <"+this.endpoints.baseClass+"> . ?a geo-pos:lat ?lat . ?a geo-pos:long ?long"+extent+filter+"} limit 5000";
	  //
	  this.query.loadCount = "select ?a ?lat ?long WHERE {" + extent + " ?a ?p ?o . FILTER(?o = <" +  this.endpoints.baseClass + ">) . ?a geo-pos:lat ?lat . ?a geo-pos:long ?long" + filter + "} limit 5000";
	  // this.query.loadCount = "select ?a ?lat ?long where { ?a a <" + this.endpoints.baseClass + "> . {select ?a ?lat ?long where { " + extent + " ?a geo-pos:lat ?lat . ?a geo-pos:long ?long .}} " + filter + " . } limit 5000"
      // enable inference when finding instances for a class
      var url = this.endpoints.sparql + "?query=" + encodeURIComponent(this.prefixes.geopos + " " + this.prefixes.geo + " " + this.prefixes.omgeo + " " + this.prefixes.xsd + " " + this.query.loadCount) + "&Accept=" + encodeURIComponent(this.params.format) + "&timeout=3000&debug=on";

      $.ajax({
	    url: url,
	    type: 'GET',
	    dataType: 'json',
	    success: function(data, textStatus, xhr) {
		var cnt = -99;
		var infite = '&infin;';
		stkoData = data;

    cnt = data.results.bindings.length;

		// fix the '-99' bug
		// if (data.results.bindings.length == 0) {
  //                 cnt = 0;
  //               }

		// if (data.results.bindings.length > 0 && data.results.bindings[0].hasOwnProperty('cnt')) {
		//   cnt = data.results.bindings[0].cnt.value;
		// }
		// var symb = cnt == -99 ? infite : cnt;
    if (cnt>=5000) {
      $('#wrapperCount').html("Number of matching entities: <b>"+cnt+"+")+"</b>";
    }
    else {
      $('#wrapperCount').html("Number of matching entities: <b>"+cnt)+"</b>";
    }

		
		if (cnt > 5000 || cnt == -99) {
		    $('#doQueryEntities').addClass('btndisabled');
		    $('#doQueryEntities').html('TO MANY ENTITIES, ZOOM IN');
		} else if (cnt = 0) {
		    $('#doQueryEntities').addClass('btndisabled');
		    $('#doQueryEntities').html('NO ENTITIES IN MAP EXTENT');
		} else {
		    $('#doQueryEntities').removeClass('btndisabled');
		    $('#doQueryEntities').html('ADD TO LAYERS');
		}


	      
	},
	    error: function(xhr, textStatus, errorThrown) {
		_UTILS.showModal("error", textStatus);
	    }
	}); 
      // select count(distinct ?a) WHERE { ?a a <http://dbpedia.org/ontology/Garden> . ?a <http://www.w3.org/2003/01/geo/wgs84_pos#lat> ?b . FILTER (?b > 40.00)}
    
  }

  _STKO.layers.layers = {};

_STKO.layers.addLayer = function() {
      var filter = "";
      var property = "";
      var count = 0;
      for(var key in _STKO.params.restrictions) {
	  var filtertype = _STKO.params.restrictions[key][0][2];
	  property = key;
	  if (filtertype == "Literal (int" || filtertype == "Literal (flo" || filtertype == "Literal (dou") {
	    filter += " . ?a <"+key+"> ?b"+count+" . FILTER (";
	    for(var i=0;i<_STKO.params.restrictions[key].length;i++) {
		if (_STKO.params.restrictions[key][i][0] == "≠")
		    var asdf = "!=";
		else
		    var asdf = $("<div/>").html(_STKO.params.restrictions[key][i][0]).text();
		filter += "?b"+count+" " + asdf + " " + _STKO.params.restrictions[key][i][1] + " && ";
	    }
	    filter = filter.substr(0, filter.length-4);
	    filter += ")";
	  } else if (filtertype == "Literal (Str") {
	    filter += " . ?a <"+key+"> ?b"+count+" . FILTER (";
	    for(var i=0;i<_STKO.params.restrictions[key].length;i++) {
		if (_STKO.params.restrictions[key][i][0] == "≠") {
		    var asdf = "!=";
		    filter += "!regex(str(?b"+count+"),'"+_STKO.params.restrictions[key][i][1]+"','i') && ";
		} else {
		    var asdf = $("<div/>").html(_STKO.params.restrictions[key][i][0]).text();
		    filter += "regex(str(?b"+count+"),'"+_STKO.params.restrictions[key][i][1]+"','i') && ";
		}
	    }
	    filter = filter.substr(0, filter.length-4);
	    filter += ")";
	  }
	  count++;
      }
      
      // var extent = " . ?a <http://adl-gazetteer.geog.ucsb.edu/ONT/ADL#centerLatitude> ?lat . ?a <http://adl-gazetteer.geog.ucsb.edu/ONT/ADL#centerLongitude> ?long . FILTER ( ?long > \""+Math.round(_MAP.map.getBounds().getWest()*100)/100+"\"^^xsd:float && ?long < \""+Math.round(_MAP.map.getBounds().getEast()*100)/100+"\"^^xsd:float && ?lat > \""+Math.round(_MAP.map.getBounds().getSouth()*100)/100+"\"^^xsd:float && ?lat < \""+Math.round(_MAP.map.getBounds().getNorth()*100)/100+"\"^^xsd:float)";
      
      var extent = "?a omgeo:within(" + Math.round(_MAP.map.getBounds().getSouth()*100)/100 + " " + Math.round(_MAP.map.getBounds().getWest()*100)/100 + " " + Math.round(_MAP.map.getBounds().getNorth()*100)/100 + " " + Math.round(_MAP.map.getBounds().getEast()*100)/100 + ")";

      var loadentities = "select ?a ?lat ?long WHERE {" + extent + " ?a ?p ?o . FILTER(?o = <" +  _STKO.endpoints.baseClass + ">) . ?a geo-pos:lat ?lat . ?a geo-pos:long ?long" + filter + "} limit 5000";

      // var loadentities = "select ?a ?lat ?long where { ?a a <" + _STKO.endpoints.baseClass + "> . {select ?a ?lat ?long where { " + extent + " ?a geo-pos:lat ?lat . ?a geo-pos:long ?long .}} " + filter + " . } limit 5000"

      var url = _STKO.endpoints.sparql + "?query=" + encodeURIComponent(_STKO.prefixes.geo + " " + loadentities) + "&Accept=" + encodeURIComponent(_STKO.params.format) + "&timeout=3000&debug=on&infer=false";
      var n = _UTILS.getname(_STKO.endpoints.baseClass,"#");
      var nid = n.name+"_"+Date.now();
      _STKO.layers.layers[nid] = {url:url,maplayer:null, color:_MAP.markericons[Math.floor(Math.random()*7)], name: n.name, graph:_STKO.endpoints.graph, endpoint:_STKO.endpoints.sparql};
    
      _STKO.params.restrictions = [];
      $('#wrapperFacets').html("");
      $('#wrapperLayers').animate({left:'0px'});
      _UTILS.accordion.expand("classes");
      
      var l = "";
      for (var property in _STKO.layers.layers) {
	  if (_STKO.layers.layers.hasOwnProperty(property)) {
	      l = "<div style='float:left;clear:both;'><img onclick='_STKO.layers.toggleLayer(\""+property+"\");' src='img/chkoff.png' id='chk_"+property+"' style='cursor:pointer;float:left;'/><div style='border:solid 1px #333;margin-right:10px;margin-top:1px;width:15px;height:15px;border-radius:3px;float:left;background-color:#"+_STKO.layers.layers[property].color+"'></div> <div style='float:left;'>"+_STKO.layers.layers[property].name+"</div></div><br/>";
	  }
      }
      $('#layersContainer').append(l);
      $('#sidebar2').hide();
      $('#sidebar1').show();
      
}

_STKO.layers.toggleLayer = function(layername) {
    var chk = $('#chk_'+layername).attr('id');
    var src = $('#chk_'+layername).attr('src');
    if (src == "img/chkoff.png") {
	$('#chk_'+layername).attr('src','img/chkon.png');
	this.activeLayer = layername;
	_STKO.loadEntities();
    } else {
	$('#chk_'+layername).attr('src','img/chkoff.png');
	_MAP.map.removeLayer(this.layers[layername].maplayer);
	// dispPopup = false;
    }
}

  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
