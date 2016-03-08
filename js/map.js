function mapGraph(nodes,links){
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
        .attr("d", path);
    var customLine = d3.svg.line()
                       .interpolate("basis");
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
          id: function (d) { return d.name; }
       })
       .style("fill", "red")

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
          id: function (d,i) { return i ; }
          })
  });
}