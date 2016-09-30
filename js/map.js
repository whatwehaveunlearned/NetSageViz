function mapGraph(data){
  queryObjects[counter].graphs.map.links = data.links;
  queryObjects[counter].graphs.map.nodes = data.nodes;
  var links = data.links;
  var nodes = data.nodes;
  //#################################### AUX FUNCTIONS ############################
  function handleMouseOver(d,i){
    //Eliminate events on lines enhaces interaction with nodes
    //d3.selectAll(".links")
    //  .attrs("pointer-events","none")
    div = d3.select("#mapTooltip");
    div.transition()
       .duration(500)
       .style("opacity", .9);
    var nodeLinks="";
    //If mouseoverNode
    if(this.classList[0]==="nodes"){
      //Change size of node
      d3.select(this)
        .transition()
        .duration(500)
        .style('stroke-width','2')
        .attr('r',10)
      //Get the text for the links
      for (var each in d.links){
        nodeLinks = nodeLinks + ("<p>" + eval("queryObjects["+this.id.split("-")[1][0]+"].links[d.links[each]].node") + "- " + eval("queryObjects["+this.id.split("-")[1][0]+"].links[d.links[each]].intf") + "</p>")
      }
      div.html("<p id ='mapTooltipname'>" + d.node + "</p>"+ nodeLinks )
         .style("left", (d3.event.pageX - 230) + "px")
         .style("top", (d3.event.pageY - 340) + "px");
    }else{
      //If MouseoverLink
      div.html("<p id ='mapTooltipname'>" + data.links[i].description + "</p> Max        bandwidth: "+ data.links[i].max_bandwidth/1000000000 + "Gb" )
         .style("left", (d3.event.pageX - 230) + "px")
         .style("top", (d3.event.pageY - 340) + "px");
    }
  }
  function handleMouseOut(d,i){
    //return events on lines
    //d3.selectAll(".links")
    //  .attrs("pointer-events","auto")
    if(this.classList[0]==="nodes"){
      d3.select(this)
        .transition()
        .duration(500)
        .style('stroke','black')
        .style('stroke-width','1')
        .attr('r',5)
      var nodeLinks="";
    }
    div = d3.select("#mapTooltip");
    div.transition()
       .duration(500)
       .style("opacity", 0);
  }

  function createLegend(svgGroup, colorNodes, colorLinks,maxDataLinks,maxDataNodes){
    //Create gradients the id assigned has to be the same that appears in the fill parameter of the rectangle
    createGradient("linkGradient",svgGroup,colorLinks(0),colorLinks(maxDataLinks));
    createGradient("nodesGradient",svgGroup,colorNodes(0),colorNodes(maxDataNodes));
    var legend = svgGroup.append('g')
                         .attrs({
                            "class":"mapLegend",
                            "transform": "translate(" + (width - 130) + "," + (height - 110) + ")",
                         })
    legend.append("rect")
            .attrs({
              "id": "linksLegend",
              "height": 100,
              "width": 20,
              "fill": "url(#linkGradient)",
              "stroke":"rgb(0,0,0)",
              "stroke-width":0.5
            });
    //Add max and minimum value to link Legend
    legend.append("text")
            .attrs({
              "transform": "translate(" + (-60) + "," + 10 + ")"
            })
            .text(Math.ceil(maxDataLinks) + " Mb/s")
    legend.append("text")
            .attrs({
              "transform": "translate(" + (-40) + "," + 98 + ")"
            })
            .text("0 Mb/s")
    //Add max and minimum value to link Legend
    legend.append("text")
            .attrs({
              "transform": "translate(" + 65 + "," + 10 + ")"
            })
            .text(Math.ceil(maxDataNodes) + " Mb/s")
    legend.append("text")
            .attrs({
              "transform": "translate(" + 65 + "," + 98 + ")"
            })
            .text("0 Mb/s")
    legend.append("rect")
            .attrs({
              "class": "mapLegend2",
              "id": "nodesLegend",
              "transform": "translate(" + (40) + "," + 0 + ")",
              "height": 100,
              "width": 20,
              "fill": "url(#nodesGradient)",
              "stroke":"rgb(0,0,0)",
              "stroke-width":0.5
            })
  }
  //Aux function to create an svg vertical Gradient for Legends
  function createGradient(id,svgGroup,startColor,endColor){
    //Append a defs (for definition) element to your SVG
    var defs = svgGroup.append("defs");

    //Append a linearGradient element to the defs and give it a unique id
    var linearGradient = defs.append("linearGradient")
        .attr("id", id);
    //Vertical gradient
    linearGradient
        .attrs({
          "x1": "0%",
          "y1": "0%",
          "x2": "0%",
          "y2": "100%"
        });
    //Set the color for the start (0%)
    linearGradient.append("stop")
        .attrs({
          "offset": "0%",
          "stop-color": endColor //Color bottom
        })
    //Set the color for the end (100%)
    linearGradient.append("stop")
        .attrs({
          "offset": "100%",
          "stop-color": startColor //Color top
        })
    return linearGradient;
  }
  //#################################### END AUX FUNCTIONS ########################
  // Define the div for the tooltip
  var div = d3.select("#AppRegion"+counter).append("div")
    .attrs({
      "id": "mapTooltip"
    })
    .style("opacity", 0);
  var margin = {top: 0, right: 0, bottom: 0, left: 0},
        width = 1197 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;
  var svgMap = d3.select("#AppRegion"+counter)
      .append("div")
      .attrs({
        "id":"map"+counter,
        "class":"map"
      })
      .append("svg")
      .attrs({
        width:width + margin.left + margin.right,
        height:height + margin.top + margin.bottom
      })
  var map = svgMap.append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  //var active = d3.select(null);

  d3.json("world.json", function(error, world) {
    if (error) return console.error(error);
    var subunits = topojson.feature(world, world.objects.subunits);
    var projection = d3.geoMercator()
    	  .scale(240)
    	  .rotate([-220,-5]);
    var path = d3.geoPath()
    	  .projection(projection);
    map.append("path")
        .datum(subunits)
        .attrs({
          "d": path,
          "id":"worlldMap"+counter
        })
    //create colors for the links
    //Calculate Max values for scales
    var maxDataLinks=[];
    var maxDataNodes=[];
    for(var each in eval("queryObjects["+counter+"].links")){
      maxDataLinks.push(eval("d3.max([queryObjects["+counter+"].links[each].data.input.avg,queryObjects["+counter+"].links[each].data.output.avg])"));
      maxDataNodes.push(eval("d3.max([queryObjects["+counter+"].nodes[each].data.input.avg,queryObjects["+counter+"].nodes[each].data.output.avg])"));
    }
    maxDataLinks = d3.max(maxDataLinks);
    maxDataNodes = d3.max(maxDataNodes);
    var colorLinks = d3.scaleLinear().domain([0,maxDataLinks])
    .interpolate(d3.interpolateHcl)
    .range([d3.rgb("#E1F5FE"), d3.rgb("#01579B")]);
    var colorNodes = d3.scaleLinear().domain([0,maxDataNodes])
    .interpolate(d3.interpolateHcl)
    .range([d3.rgb("#ffe0cc"), d3.rgb("#ff6600")]);

    //Create Links PlaceHolders
    d3.json("linksMetadata.json",function(error, linkValues){
      map.selectAll(".linksPlaceholder")
         .data(linkValues)
         .enter()
         .append("path")
         .datum( function(d){
            return {type: "LineString", coordinates: [[d["a_endpoint.longitude"], d["a_endpoint.latitude"]], [d["z_endpoint.longitude"],d["z_endpoint.latitude"]]]};
         })
         .attrs({
            class:"linksPlaceholder",
            d:path,
            id: function (d,i) {
              return "linksPlaceholder-"+ counter+ i ; }
            })
         .styles({
            "stroke-width": function(d,i){
              return ((linkValues[i].max_bandwidth/10000000000) + 2 )}, //Transform to Terabyte and adjust size
         })

      //After we create the Real Links so they render on top
      map.selectAll(".links")
        .data(data.links)
        .enter()
        .append("path")
        .datum( function(d){
            return {type: "LineString", coordinates: [[d["a_endpoint.longitude"], d["a_endpoint.latitude"]], [d["z_endpoint.longitude"],d["z_endpoint.latitude"]]]};
        })
        .attrs({
          class:"links",
          d:path,
          id: function (d,i) {
            return "links-"+ counter+ i ; }
        })
        .styles({
          "stroke-width": function(d,i){
            return ((data.links[i].max_bandwidth/10000000000) + 2 )}, //Transform to Terabyte and adjust size
          "stroke": function(d,i){
            return colorLinks(d3.mean([data.links[i].data.input.avg,data.links[i].data.output.avg]))} //We are coloring links based on avg use
        })
        .on("mouseover", handleMouseOver)
        .on("mouseout",handleMouseOut);

        //Create Nodes PlaceHolders
        d3.json("nodesMetadata.json",function(error, nodeValues){
          map.selectAll(".nodesPlaceholder")
             .data(nodeValues)
             .enter()
             .append("circle")
             .attrs({
                cx: function (d) {
                  return projection([d.longitude, d.latitude])[0]; },
                cy: function (d) { return projection([d.longitude, d.latitude])[1]; },
                r: 5,
                class: "nodesPlaceholder"
             })
             .styles({
                fill: function(d,i) {
                  return "white";
                }
             })
             .on("mouseover",handleMouseOver)
             .on("mouseout",handleMouseOut);
          //Create Real ExchangePoints
          map.selectAll(".nodes")
             .data(data.nodes)
             .enter()
             .append("circle")
             .attrs({
                cx: function (d) {
                  return projection([d.lon, d.lat])[0]; },
                cy: function (d) { return projection([d.lon, d.lat])[1]; },
                r: 5,
                class: "nodes",
                id: function (d,i) { return "nodes-"+ counter + i; }
             })
             .styles({
                fill: function(d,i) {
                  return colorNodes(avg([data.nodes[i].data.input.avg,data.nodes[i].data.output.avg]));
                }
             })
             .on("mouseover",handleMouseOver)
             .on("mouseout",handleMouseOut);
          //Create Legend
          createLegend(map, colorNodes, colorLinks,maxDataLinks,maxDataNodes);
        });
    });
  });
}