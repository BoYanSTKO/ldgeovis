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

  _MAP.markers = [];
  _MAP.groupLayers = {};
  _MAP.markericons = ['0067a3','d252b9','d63e2a','f69730','5b396b','72b026','38aadd'];

 
  function loadMap() {
    
      // Set up the Map Object
      _MAP.map = L.map('map',{zoomControl:false}).setView([20,10], 3);
      L.tileLayer('https://{s}.tiles.mapbox.com/v3/{id}/{z}/{x}/{y}.png', {
	      maxZoom: 18,
	      id: 'bradley123.k313cfag',
	      
      }).addTo(_MAP.map); 
      
      // Every time the map is moved check to see how many entities fit the criteria
      _MAP.map.on('moveend', function() {
	 _STKO.loadCount();
      });
    
  }
// var fieldNumber = 0;
// var dispPopup = false;  
  _MAP.displayPopup = function(d, id) {
  	// dispPopup = true;
      var content = "";
      var ns = [];
      // fieldNumber = d.length;
      // console.log(fieldNumber);
      for(var i=0;i<d.length;i++) {
	  var li = d[i].a.value.lastIndexOf('#');
	  var sub = "";
	  if (li != -1) {
	    var n = _UTILS.getname(d[i].a.value, "#");
	    var namespace = loopNameSpaces(ns, n.prefix+"#");
	  } else {
	    var n = _UTILS.getname(d[i].a.value, "/");
	    var namespace = loopNameSpaces(ns, n.prefix+"/");
	  }
	  content += "<span title='"+namespace[1]+"'>" + namespace[0] + ":"+n.name+"</span>: <span class='subprop'>" + d[i].b.value + "</span>  <button class='fieldEdit' type='submit' disabled='true'>Edit</button><br/>";
      }
      $('#pop'+id).html(content);
      // slightly offset the center so the entire popup can be seen.	
      var ll = this.markers[id].getLatLng();
      this.map.setView([ll.lat+0.2, ll.lng],10);
      
      function loopNameSpaces(ns, uri) {
	  var match = false;
	  for(var pre in prefixcc) {
	      if (prefixcc[pre] == uri)
		  match = new Array(pre, uri);
	  }
	  if (!match) {
	      ns.push({"ns":"ns"+ns.length, "val":uri});
	      return new Array("ns"+(ns.length-1),uri);
	  } else {
	      return match;
	  }
      }
  }
  
  _MAP.showMarkerPopup = function(i, uri) {
      this.markers[i].openPopup();
      _STKO.loadDetails(uri, i);
      // dispPopup = true;
  }
  
  _MAP.mapEntities = function(m) {
  	// console.log(m);
      this.markers = [];
      if(this.map.hasLayer(this.groupLayer)) {
	  this.map.removeLayer(this.groupLayer);
      }
      // console.log("123");
      var markericon = L.icon({iconUrl: "img/marker_"+_STKO.layers.layers[_STKO.layers.activeLayer].color+".png", iconSize:[25, 34], iconAnchor:[12, 33], popupAnchor:[0, -20]});
      // console.log(m.length);
      for(var i=0;i<m.length;i++) {
      	// console.log(i);
	  
	  var point = L.marker([m[i].lat.value, m[i].long.value], {icon: markericon});
	  // console.log(point);
	  // TO DO. Currently only takes the first point geometry.  Should take all an possibly map to polygon?
	 
	  //var point = omnivore.wkt.parse(geo);
	  var popupOptions = {'minWidth': '800','maxWidth': '600',  'closeButton': true}
	  
	  point.bindPopup("<b>"+decodeURIComponent(m[i].a.value)+"</b> <button id='turnOnEdit' type='submit'>Turn Editing On</button><br/><div id='pop"+i+"' class='popupdiv'><img src='img/loading.gif' style='margin-left:380px;margin-top:100px'/></div>", popupOptions);
	  point.urig = m[i].a.value;
	  point.idg = i;
	  point.graph = _STKO.layers.layers[_STKO.layers.activeLayer].graph;
	  point.endpoint = _STKO.layers.layers[_STKO.layers.activeLayer].endpoint;
	  point.on('click', function(e) {
	      _STKO.loadDetails(this.urig, this.idg, this.graph, this.endpoint);
	  });
	  this.markers.push(point);
      }
      _STKO.layers.layers[_STKO.layers.activeLayer].maplayer = L.layerGroup(this.markers);
      this.map.addLayer(_STKO.layers.layers[_STKO.layers.activeLayer].maplayer);
   
     
  }

  // $(function(){


  // // 	// console.log("test");
  // // 	// $('#fieldEdit').each(function(i, obj){
  // //  //      console.log(i);
  // //  //      // $('#fieldEdit' + i).html('Save');
  // //  //      $(this).on('click', function(){
  // //  //      	$(this).html('Save');
  // //  //      });
  // // $('.fieldEdit').on('click', function(){
  // // 	for (var i=0;i<fieldNumber;i++) {
  // // 		if ($('.fieldEdit').attr('id') == ("'" + i + "'")){
  // // 			$(".fieldEdit[id='" + i + "']").html("save");
  // // 		};
  // // 	};

  // // });
  // 	});



  