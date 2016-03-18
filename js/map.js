function mapGraph(nodes,links,data){
  //#################################### AUX FUNCTIONS ############################
  function handleMouseOver(d,i){
    //Eliminate events on lines enhaces interaction with nodes
    d3.selectAll(".links")
      .attr("pointer-events","none")
    var nodeLinks="";
    //Change size of node
    d3.select(this)
      .transition()
      .duration(200)
      .attr('fill', "blue")
      .attr('r',10)
    div = d3.select("#mapTooltip");
    div.transition()
       .duration(200)
       .style("opacity", .9);
    //Get the text for the links
    for (var each in d.links){
      nodeLinks = nodeLinks + ("<p>" + links[d.links[each]].node + "</p>")
    }
    div.html("<p id ='mapTooltipname'>" + d.name + "</p>"+ nodeLinks )
       .style("left", (d3.event.pageX + 5) + "px")
       .style("top", (d3.event.pageY - 28) + "px");
  }
  function handleMouseOut(d,i){
    //return events on lines
    d3.selectAll(".links")
      .attr("pointer-events","auto")
    d3.select(this)
      .transition()
      .duration(200)
      .attr('fill', "blue")
      .attr('r',5)
    var nodeLinks="";
    div = d3.select("#mapTooltip");
    div.transition()
       .duration(200)
       .style("opacity", 0);
  }
  //#################################### END AUX FUNCTIONS ########################
  // Define the div for the tooltip
  var div = d3.select("body").append("div")
    .attr("id", "mapTooltip")
    .style("opacity", 0);
  var margin = {top: 0, right: 0, bottom: 0, left: -25},
        width = 800 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;
  var svgMap = d3.select("body")
      .append("div")
      .attr("id","map")
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
        .attr("id","worlldMap");
    var customLine = d3.svg.line()
                       .interpolate("basis");

     //create colors for the links
    //Calculate Max values for scales
    var color = d3.scale.linear().domain([0,500])
    .interpolate(d3.interpolateHcl)
    .range([d3.rgb("#E1F5FE"), d3.rgb("#01579B")]);

    //Create Links
    map.selectAll(".links")
      .data(links)
      .enter()
      .append("path")
      .datum( function(d){
          return {type: "LineString", coordinates: [[d["a_endpoint.longitude"], d["a_endpoint.latitude"]], [d["z_endpoint.longitude"],d["z_endpoint.latitude"]]]};
      })
      .attr({
        class:"links",
        d:path,
        id: function (d,i) { return "link"+i ; }
      })
      .style({
        "stroke-width": function(d,i){ console.log(i);return ((links[i].max_bandwidth/100000000000)+2)},
        "stroke": function(d,i){
          console.log("num:" + i + " " + color(avg([queryData.results[i].input.avg,queryData.results[i].output.avg])));return color(avg([queryData.results[i].input.avg,queryData.results[i].output.avg]))}
      })

    //Create ExchangePoints
    map.selectAll(".nodes")
       .data(nodes)
       .enter()
       .append("circle")
       .attr({
          cx: function (d) { return projection([d.lon, d.lat])[0]; },
          cy: function (d) { return projection([d.lon, d.lat])[1]; },
          r: 5,
          class: "nodes",
          id: function (d,i) { return "node"+i; }
       })
       .on("mouseover",handleMouseOver)
       .on("mouseout",handleMouseOut)
  });
}