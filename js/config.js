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

  var _MAP = {};

  var _UTILS = {};
  var _STKO = {"endpoints": {}, "params":{}, "query": {}, "display": {}, "layers": {}};
  _STKO.prefixes = {};
  _STKO.prefixes.rdfs = "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>";
  _STKO.prefixes.geo = "PREFIX geo: <http://www.w3.org/2003/01/geo/wgs84_pos#>";
  _STKO.prefixes.geopos = "PREFIX geo-pos: <http://www.w3.org/2003/01/geo/wgs84_pos#>";
  _STKO.prefixes.omgeo = "PREFIX omgeo: <http://www.ontotext.com/owlim/geo#>";
  _STKO.prefixes.xsd = "PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>";
  _STKO.params.restrictions = {};
  var group = null;
  var markers = [];
  var markericon = L.icon({iconUrl: 'img/marker_blue.png', iconSize:[25, 34], iconAnchor:[22, 34], popupAnchor:[-12, 17]})
  
  $(function() {

      loadMap();
    
      // Add events to elements
      $('#doQuery').on('click', function() {
	  _STKO.loadClasses();
      });
      $('#doQueryEntities').on('click', function() {
	  //_STKO.loadEntities();
	  _STKO.layers.addLayer();
      });
      $('#back3').on('click', function() {
	  _UTILS.back3();
      });
      $('#titleClasses').on('click', function() {
	  _UTILS.accordion.expand("classes");
      });
      $('#titleProperties').on('click', function() {
	  _UTILS.accordion.expand("properties");
      });
      $('#modalMessage > #close').on('click', function() {
	  $('#modalMessage').fadeOut();
      });
      $('#sidebar1 > #viewDoQuery').on('click', function() {
	  var baseclass = $('#ont').val();
	  var query = "SELECT ?child ?parent (count(?b) as ?count)<br/> WHERE {<br/>&nbsp;&nbsp;?child rdfs:subClassOf* &lt;" + (baseclass) + "&gt; . <br/>&nbsp;&nbsp;?child rdfs:subClassOf ?parent .<br/>&nbsp;&nbsp;?b a ?child<br/>}<br/> GROUP BY ?child ?parent";
	  _UTILS.showModal("SPARQL Query", query, 500, 200);
      });
      
      $('#viewLoadProperties').on('click', function() {
	  if (_STKO.endpoints.hasOwnProperty("baseClass"))
	      var baseclass = _STKO.endpoints.baseClass;
	  else
	      var baseclass = $('#ont').val();
	  var query = "SELECT ?prop (count(?prop) as ?count) <br/> WHERE {<br/>&nbsp;&nbsp;?a ?prop ?c .<br/>&nbsp;&nbsp;?a a &lt;" + baseclass + "&gt;<br/>}<br/>ORDER BY desc (?count)";
	  _UTILS.showModal("SPARQL Query", query, 420, 200);
      });
      
      $('#about').on('click', function() {
	  _UTILS.showModal("Alexandria Digital Library", txtabout, 700,400);
      });
      
      $('#wrapperLayersExpand').on('click', function() {
	  
	  if ($('#wrapperLayers').css('left') == '0px') {
	    $('#wrapperLayers').animate({left: '-322px'});
	  } else {
	    $('#wrapperLayers').animate({left:'0px'});
	  }
      });
      
      $('#wrapperSideBarExpand').on('click', function() {
	  if ($('.sidebar').css('right') == '0px') {
	    $('.sidebar').animate({right:'-422px'});
	    $(this).css('background-image','url(\'img/wback.png\')');
	  } else {
	    $('.sidebar').animate({right:'0px'});
	    $(this).css('background-image','url(\'img/wforward.png\')');
	  }
      });
      // console.log(fieldNumber);

    // for (var i=0; i<fieldNumber;i++){

    //   $('#fieldEdit' + i).on('click', function(){
    //     console.log(i);
    //     $('#fieldEdit' + i).html('Save');

    //   });
    // };


var originalObject;

    $(document).on('click', '#turnOnEdit', function(e){
      if ($(this).html()=="Turn Editing On") {
        $("#turnOnEdit").prop("disabled", true);
      //$("#turnOnEdit").prop("disabled", true);
      $('#loginform').dialog('open');
      e.preventDefault();
      // var verified=false;
      $("#submitCredentials").click(function(e){
        e.preventDefault();
        $('#loginform').dialog( "close" );
        var auth = $("#passwordField").val();
        // console.log($("#passwordField").val());
        $.post("http://adl-gazetteer.geog.ucsb.edu:7077/authen", {
          "password":  auth
        }).done(function(data){
          if (data == "true") {
            $(".fieldEdit").prop("disabled", false);
            $("#turnOnEdit").html("Turn Editing Off");
            $("#turnOnEdit").prop("disabled", false);

            // verified=true;
          }
          else {
            $("#turnOnEdit").prop("disabled", false);
            // verified=false;
            
          };
        });
      });
      }
      else {
        $("#turnOnEdit").html("Turn Editing On");
        $(".fieldEdit").prop("disabled", true);
        //$("#turnOnEdit").prop("disabled", true);
      }


        // var auth = prompt("Please enter the credentials","");
        //   if (auth != null) {
        //   $.post("http://adl-gazetteer.geog.ucsb.edu:7077/authen",{
        //     "password" : auth
        //   }).done(function(data){
        //     if (data == "true") {
        //       $(".fieldEdit").prop("disabled", false);

        //         // editable = true;

        //     }
        //     else {
        //       // editable = false;
        //       $("#turnOnEdit").prop("disabled", false);
        //       alert("Credentials incorrect! Editing denied!");

        //     }
        //   })
          
        // }
        // else {
        //   // editable = false;
        //   $("#turnOnEdit").prop("disabled", false);
        //   alert("Credentials incorrect! Editing denied!");
        // }
      });

    $('#loginform').dialog({
    autoOpen: false,
    modal: true,
    resizable: false,
    draggable: false,
    // Cancel: function(){
    //   $("#turnOnEdit").prop("disabled", false);
    //   $('#loginform').dialog( "close" );
    // },
    close: function(){
      $("#turnOnEdit").prop("disabled", false);
      // $('#loginform').dialog( "close" );
    }


    });

    // the html is added dynamically, so delegated event handler is needed.
    $(document).on('click','.fieldEdit',function(){
            // console.log("clicked");
      if ($(this).html()=="Edit") {
          $(this).html('Save');
          var spanHtml = $(this).prev('span').html();
          originalObject = spanHtml;
          if (originalObject.startsWith("http")) {
            originalObject = "<" + originalObject + ">";
          }
          else {
            originalObject = '"' + originalObject + '"';
          }
          // console.log(originalObject);
          var editableText = $('<textarea />');
          editableText.val(spanHtml);
          $(this).prev('span').replaceWith(editableText);
          editableText.focus();

      }
      else {
        $(this).html('Edit');
        var spanHtml = $(this).prev('textarea').val();
        var saveText = $('<span />');
        saveText.html(spanHtml);
        $(this).prev('textarea').replaceWith(saveText);
        $(this).prev('span').addClass('subprop');
        var predicateNSURI = $(this).prev('span').prev('span').attr('title');
        var predicateURI = $(this).prev('span').prev('span').html().split(":")[1];
        var predicateURI = predicateNSURI + predicateURI;
        var entityURI = $('.leaflet-popup-content').find('b').html();
        if (spanHtml.startsWith("http")) {
          spanHtml = "<" + spanHtml + ">";
        }
        else {
          spanHtml = '"' + spanHtml + '"';
        }
        // console.log(predicateURI);
        // console.log(spanHtml);
        // console.log(entityURI);
// console.log(originalObject);
        var newStatement = "delete {<" + entityURI + "> <" + predicateURI + "> " + originalObject + " .} insert {<" + entityURI + "> <" + predicateURI + "> " + spanHtml + " .} where {<" + entityURI + "> <" + predicateURI + "> " + originalObject + " .}"

        var url = "http://adl-gazetteer.geog.ucsb.edu:8080/repositories/ADL/statements" + "?update=" + encodeURIComponent(newStatement);

        $.ajax({
        url: url,
        type:'POST',
        // dataType: 'json',
        // headers: {Connection: close},
        success: function(data, textStatus, xhr) {
          alert("Edits saved successfully!");
          //enable button
          // $("#createEntity").prop("disabled", false);
      //console.log("success");
      //console.log(data.results.bindings);
      // _STKO.display.loadClasses(data.results.bindings);
      // $('#doQuery').html("QUERY");
        },
        error: function(xhr, textStatus, errorThrown) {
      //console.log(url);
      //console.log("error");
      //console.log(data.results.bindings)
      _UTILS.showModal("error", textStatus, 300, 100);
        }
    });


      }
      
    });

// function authenInput() {
// }

    // $.getJSON( "http://api.hostip.info/get_json.php",
    //     function(data){
    //         console.log(data.ip);        }
    // );
// $(document).on('click','.fieldEdit',function(){
//       $("#dialog-form").dialog({
//         close: function(event, ui) { 
//             // do whatever you need on close
//         }
//     });

// });


      
      
  });