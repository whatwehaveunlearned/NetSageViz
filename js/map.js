function mapGraph(){
  var margin = {top: 0, right: 0, bottom: 0, left: -25},
        width = 800 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

  var svgMap = d3.select("body")
      .append("div")
      .attr("id","map")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);
  var map = svgMap.append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var active = d3.select(null);

  d3.json("world.json", function(error, world) {
    if (error) return console.error(error);
    var subunits = topojson.feature(world, world.objects.subunits);
    var projection = d3.geo.mercator()
    	  //.center([0,30])
    	  .scale(150)
    	  .rotate([-270,0]);
    	  //.translate([width/3+300,height/2]);
    var path = d3.geo.path()
    	  .projection(projection);
    map.append("path")
        .datum(subunits)
        .attr("d", path);
    var customLine = d3.svg.line()
                       .interpolate("basis");              


    d3.csv("cities.csv", function(error, data) {
          map.selectAll("circle")
             .data(data)
             .enter()
             .append("circle")
             .attr("cx", function(d) {
                     return projection([d.lon, d.lat])[0];
             })
             .attr("cy", function(d) {
                     return projection([d.lon, d.lat])[1];
             })
             .attr("r", 5)
             .style("fill", "red")
      });
    
    d3.csv("links.csv",function(error,data){
      map.selectAll(".links")
        .data(data)
        .enter()
        .append("path")
          .datum( function(d){
            if(d.custom=="no") return {type: "LineString", coordinates: [[d.originLon, d.originLat], [d.destLon,d.destLat]]};
          })
          .attr("class", "links")
          //.attr("id","arc1")
          .attr("d", path);
     /* map.selectAll(".shadows")
        .data(data)
        .enter()
        .append("line")
        .attr("x1", function(d) {
          return projection([d.originLon,d.originLat])[0];
        })
        .attr("y1",function(d) {
          return projection([d.originLon,d.originLat])[1];
        })
        .attr("x2", function(d) {
          return projection([d.destLon,d.destLat])[0];
        })
        .attr("y2", function(d) {
          return projection([d.destLon,d.destLat])[1];
        })
        .attr("class","shadows")
        */
     });

    d3.csv("customLinks.csv",function(error,data){
      map.selectAll(".links")
        .data(data)
        .datum(function(d){
              return [projection([d.originLon, d.originLat]),projection([d.midDestLon1, d.midDestLat1]),projection([d.midDestLon2, d.midDestLat2]), projection([d.destLon,d.destLat])];
        })
        .attr('d',customLine)
        .attr("class","customLinks")
     /* map.selectAll(".shadows")
        .data(data)
        .enter()
        .append("line")
        .attr("x1", function(d) {
          return projection([d.originLon,d.originLat])[0];
        })
        .attr("y1",function(d) {
          return projection([d.originLon,d.originLat])[1];
        })
        .attr("x2", function(d) {
          return projection([d.destLon,d.destLat])[0];
        })
        .attr("y2", function(d) {
          return projection([d.destLon,d.destLat])[1];
        })
        .attr("class","shadows")
      */
   });
   
  /* d3.csv("histogram.csv",function(error,data){
    var x = d3.scale.ordinal()
        .rangeRoundBands([0, histogramWidth], .1);

    var y = d3.scale.linear()
        .range([histogramHeight, 0]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left");

    x.domain(d3.range(100))
    y.domain([0, 50]).nice();

    histograms.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + histogramHeight + ")")
          .call(xAxis);

      histograms.append("g")
          .attr("class", "y axis")
          .call(yAxis)
        .append("text")
          .attr("transform", "rotate(-90)")
          .attr("y", 6)
          .attr("dy", ".71em")
          .style("text-anchor", "end")
          .text("ss");

      histograms.selectAll(".bar")
          .data(data)
        .enter().append("rect")
          .attr("class", "bar")
          .attr("x", function(d,i) { 
            return x(i); })
          .attr("width", x.rangeBand())
          .attr("y", function(d) { 
            return y(d.value);
           })
          .attr("height", function(d) { return histogramHeight - y(d.value); });
   });*/


  });
  /*
  var zoom = d3.behavior.zoom()
      .on("zoom",function() {
          map.attr("transform","translate("+ 
              d3.event.translate.join(",")+")scale("+d3.event.scale+")");
  });

  map.call(zoom);*/
}