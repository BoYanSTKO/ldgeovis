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

  // Display the results of the loadClasses ajax call
  _STKO.display.loadClasses = function(d) {
      $('#sidebar1').hide();
      $('#sidebar2').show();
      
      var data = {};
      var parents = [];
      var counts = [];
      
	
      var n = _UTILS.getname(_STKO.endpoints.baseclass, "#");
//console.log(n);
      data[n.name] = null;
//console.log(data[n.name]);
      for(var i=0;i<d.length;i++) {
	  var n = _UTILS.getname(d[i].child.value, "#");
//console.log(n)
	  var n2 = _UTILS.getname(d[i].parent.value, "#");
//console.log(n2)
	  data[n.name] = n2.name;
//console.log(data[n.name])
      };
//console.log(data);
      var treedata = parseTree(data);
      
      /* for(var i=0;i<d.length;i++) {
	  var path = getParentParent(d[i].parent.value, d, [d[i].child.value]);
	  data.push(path);
	  counts[d[i].child.value] = d[i].count.value;
      }
      
      var n = _UTILS.getname(_STKO.endpoints.baseclass, "#");
      parents.push({ "id" : _STKO.endpoints.baseclass, "parent" : "#", "text" : n.name + " <span style='font-size:0.8em'>("+counts[_STKO.endpoints.baseclass]+")</span>"});
      for(var i=0;i<data.length;i++) {
	    for(var j=data[i].length-1;j>0;j--) {
		checkParents(data[i][j-1], data[i][j]);
	    }
      } */
      $.jstree.destroy();
      
      _STKO.selectedClass = _STKO.endpoints.baseclass;
//console.log(_STKO.selectedClass);
      $('#subclasses').on('changed.jstree', function (e, data) { 
	    _STKO.selectedClass = data.node.id;
// console.log(_STKO.selectedClass)
	    _UTILS.accordion.expand("properties");
	    $('#properties').html("<img src='img/loading2.gif' style='margin-left:100px;margin-top:50px;'/>");
	    _STKO.loadProperties(_STKO.selectedClass);
      }).jstree({ 'core' : {'data' : treedata} });
      
      function parseTree(tree, root) {
	  root = typeof root !== 'undefined' ? root : null;
	  var return1 = [];
	  for(var child in tree) {
	      if(tree[child] == root) {
		  delete tree[child];
		  return1.push({text: child,state:{opened:true},id:(n.prefix+'#'+child), children:parseTree(tree, child)});
	      }
	  }
	  return return1.length == 0 ? null : return1;    
      }
      
      /*function getParentParent(parent, list, path) {
	  for(var i=0;i<list.length;i++) {
	      if (list[i].child.value == parent) {
		  path.push(parent);
		  path = getParentParent(list[i].parent.value, list, path);
	      }
	  }
	  return path;
      }
      
      function checkParents(id, parent) {
	  var match = false;
	  for(var z=0;z<parents.length;z++) {
		if (parents[z].id == id && parents[z].parent == parent) {
		    match = true;
		}
	  }
	  if (!match) {
	      var li = id.lastIndexOf('/');
	      var x = id.substr(li+1,id.length-li);
	      parents.push({ "id" : id, "parent" : parent, "text" : x + " <span style='font-size:0.8em'>("+counts[id]+")</span>"});
	  }
      } */
  }
  
  // Display the results of the loadProperties ajax call
  _STKO.display.loadProperties = function(d) {
      var content = "";
      var ns = [];
      var namespace = [];
//console.log(d);

     if (d.length >= 1) {  //check if the class has any props
      for(var i=0;i<d.length;i++) {
	  var li = d[i].prop.value.lastIndexOf('#');
	  if (li != -1) {
	    var n = _UTILS.getname(d[i].prop.value, "#");
	    namespace = loopNameSpaces(ns, n.prefix+"#");
	  } else {
	      var n = _UTILS.getname(d[i].prop.value, "/");
	      namespace = loopNameSpaces(ns, n.prefix+"/");
	  }
	  
	  content += _STKO.display.generateParams(namespace[0], namespace[1], n.name, d[i].prop.value);
	  
	 
	  
      }}
      $('#properties').html(content);
      
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
  
  _STKO.display.loadEntities = function(d) {
      $('#sidebar1').hide();
      $('#sidebar2').hide();
      $('#sidebar3').show();
      $('#results').html("");
      var counter = 0;
      for(var i=0;i<d.length;i++) {
	  var li = d[i].a.value.lastIndexOf('/');
	  var x = d[i].a.value.substr(li+1,d[i].a.value.length-li);
	  var ent = "<div id='l"+counter+"' class='resultentity' onclick='_MAP.showMarkerPopup("+i+",\""+d[i].a.value+"\")'>"+decodeURIComponent(x)+"</div>";
	  $('#results').append(ent);
	  counter++;
      }
      
   
  }
  
  
  _STKO.display.generateParams = function(namespace, uri, name, full) {
    
    var mainDiv = "<div class='proptext' id='"+namespace+name+"'>";
      mainDiv += "<div title='"+uri+"' onclick=\"_STKO.loadDateType('"+full+"', '"+namespace+name+"')\">" + namespace + ":" + name + "</div>";
      mainDiv += "<div style='color:#333;margin: 3px 0px;display:none' id='sub_"+namespace+name+"_'></div>";
      mainDiv += "<div  class='equals' id='equals_"+namespace+name+"_' style='display:none;'>"
	mainDiv += "<table id='table_"+namespace+name+"'><tr id='tr_"+namespace+name+"'><td onclick='_UTILS.toggleEquals(\"eq_"+namespace+name+"_\")' id='eq_"+namespace+name+"_' style='font-size:1.3em;width:20px;' class='eq123' title='Click to change condition'>=</td>";
	mainDiv += "<td><input type='text' id='input_"+namespace+name+"_' class='propinput' /></td><td><img id='plus_"+namespace+name+"_' onclick='_UTILS.addRow(\""+namespace+name+"\",\"\")' src='img/plus.png' style='width:20px;' title='Add Restriction' /></td>";
	mainDiv += "</tr></table>";
	mainDiv += "<div class='addtobucket' onclick='_UTILS.addToBucket(\""+namespace+"\",\""+name+"\",\""+full+"\")'>Add to Bucket</div>";
      mainDiv += "</div>";
    mainDiv += "</div>"; 
    return mainDiv;
  }

  



  

  

  

 
