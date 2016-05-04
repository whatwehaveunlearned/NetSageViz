function mapGraph(data){
  queryObjects[counter].graphs.map.links = data.links;
  queryObjects[counter].graphs.map.nodes = data.nodes;
  var links = data.links;
  var nodes = data.nodes;
  //#################################### AUX FUNCTIONS ############################
  function handleMouseOver(d,i){
    //Eliminate events on lines enhaces interaction with nodes
    d3.selectAll(".links")
      .attr("pointer-events","none")
    var nodeLinks="";
    //Change size of node
    d3.select(this)
      .transition()
      .duration(500)
      .style('stroke-width','2')
      .attr('r',10)
    div = d3.select("#mapTooltip");
    div.transition()
       .duration(500)
       .style("opacity", .9);
    //Get the text for the links
    for (var each in d.links){
      nodeLinks = nodeLinks + ("<p>" + eval("queryObjects["+this.id.split("-")[1][0]+"].links[d.links[each]].node") + "- " + eval("queryObjects["+this.id.split("-")[1][0]+"].links[d.links[each]].intf") + "</p>")
    }
    div.html("<p id ='mapTooltipname'>" + d.node + "</p>"+ nodeLinks )
       .style("left", (d3.event.pageX + 15) + "px")
       .style("top", (d3.event.pageY ) + "px");
  }
  function handleMouseOut(d,i){
    //return events on lines
    d3.selectAll(".links")
      .attr("pointer-events","auto")
    d3.select(this)
      .transition()
      .duration(500)
      .style('stroke','black')
      .style('stroke-width','1')
      .attr('r',5)
    var nodeLinks="";
    div = d3.select("#mapTooltip");
    div.transition()
       .duration(500)
       .style("opacity", 0);
  }
  //#################################### END AUX FUNCTIONS ########################
  // Define the div for the tooltip
  var div = d3.select("#query"+counter).append("div")
    .attr({
      "id": "mapTooltip"
    })
    .style("opacity", 0);
  var margin = {top: 0, right: 0, bottom: 0, left: -25},
        width = 800 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;
  var svgMap = d3.select("#query"+counter)
      .append("div")
      .attr({
        "id":"map"+counter,
        "class":"map"
      })
      .append("svg")
      .attr({
        width:width + margin.left + margin.right,
        height:height + margin.top + margin.bottom
      })
  var map = svgMap.append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  //var active = d3.select(null);

  d3.json("world.json", function(error, world) {
    if (error) return console.error(error);
    var subunits = topojson.feature(world, world.objects.subunits);
    var projection = d3.geo.mercator()
    	  .scale(150)
    	  .rotate([-270,0]);
    var path = d3.geo.path()
    	  .projection(projection);
    map.append("path")
        .datum(subunits)
        .attr("d", path)
        .attr("id","worlldMap"+counter);
    var customLine = d3.svg.line()
                       .interpolate("basis");

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
    var colorLinks = d3.scale.linear().domain([0,maxDataLinks])
    .interpolate(d3.interpolateHcl)
    .range([d3.rgb("#E1F5FE"), d3.rgb("#01579B")]);
    var colorNodes = d3.scale.linear().domain([0,maxDataNodes])
    .interpolate(d3.interpolateHcl)
    .range([d3.rgb("#ffe0cc"), d3.rgb("#ff6600")]);
    //var colorNodes = d3.scale.linear().domain([0,maxDataNodes]).range(["rgba(255,0,0,.1)", "rgba(0,255,0,1)"]);

    //Create Links
    map.selectAll(".links")
      .data(data.links)
      .enter()
      .append("path")
      .datum( function(d){
          return {type: "LineString", coordinates: [[d["a_endpoint.longitude"], d["a_endpoint.latitude"]], [d["z_endpoint.longitude"],d["z_endpoint.latitude"]]]};
      })
      .attr({
        class:"links",
        d:path,
        id: function (d,i) {
          return "links-"+ counter+ i ; }
      })
      .style({
        "stroke-width": function(d,i){
          return ((data.links[i].max_bandwidth/100000000000)+2)},
        "stroke": function(d,i){
        return colorLinks(d3.mean([data.links[i].data.input.avg,data.links[i].data.output.avg]))} //We are coloring links based on avg use
      })

    //Create ExchangePoints
    map.selectAll(".nodes")
       .data(data.nodes)
       .enter()
       .append("circle")
       .attr({
          cx: function (d) { return projection([d.lon, d.lat])[0]; },
          cy: function (d) { return projection([d.lon, d.lat])[1]; },
          r: 5,
          class: "nodes",
          id: function (d,i) { return "nodes-"+ counter + i; }
       })
       .style({
          fill: function(d,i) {return colorNodes(avg([data.links[i].data.input.avg,data.links[i].data.output.avg]))}
       })
       .on("mouseover",handleMouseOver)
       .on("mouseout",handleMouseOut)
  });
}