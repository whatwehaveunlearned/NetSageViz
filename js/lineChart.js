function lineGraph(){
	function parseQuery(){
		function parseHistogram (tsdsObject){
			var inputClean=[];
			var outputClean=[];
			for (each in tsdsObject.results.input){
				if(tsdsObject.results.input[each][1]!=null) inputClean.push(tsdsObject.results.input[each][1]/1000000000);
				if(tsdsObject.results.output[each][1]!=null) outputClean.push(tsdsObject.results.output[each][1]/1000000000);
			}
			return [inputClean,outputClean];
		}

		function parseTimeLine(tsdsObject){
			var inputClean=[];
			var outputClean=[];
			for (each in tsdsObject.results.input){
				if(tsdsObject.results.input[each][1]!=null) inputClean.push([ new Date(tsdsObject.results.input[each][0] * 1000), tsdsObject.results.input[each][1]/1000000000 ]);
				if(tsdsObject.results.output[each][1]!=null) outputClean.push( [new Date(tsdsObject.results.input[each][0] * 1000),tsdsObject.results.output[each][1]/1000000000 ]);
			}
			return [inputClean,outputClean];
		}

		d3.json("tsdTest.json",function(error,data){
			//Array to hold data from each node
			var tsdsObjects = [];
			for (each in data){
				//The input and output key is based on the query LOOK FOR THE DIFFERENT QUERIES!
				var input = data[each].query.split(', ')[2] + "," + data[each].query.split(',')[3] + "," + data[each].query.split(',')[4];
				var output = input.split("input")[0] + "output" + input.split("input")[1];
				var tsds = {
					total_raw: data[each].total_raw,
					query: data[each].query,
					total:data[each].total,
					results: {
						input: data[each].results[0][input],
						output: data[each].results[0][output]
					}
				};
				tsdsObjects.push(tsds);
			}
			//Prepare data for histograms
			var histogramData = [];
			var timeLineData = [];
			for (object in tsdsObjects){
				histogramData.push(parseHistogram(tsdsObjects[object]));
				timeLineData.push(parseTimeLine(tsdsObjects[object]));
			}
			lineChart(timeLineData,["US LHCNet","ASGCNet","CSTNet","TransPAC3","AARNet"]);
		});
	}
	//Variable to hold the data from query to TSDS and that will be passed to the different graph functions
	parseQuery();

	function lineChart(data,elements){
		var margin = {top: 10, right: 10, bottom: 30, left: 40},
	    	width = 810 - margin.left - margin.right,
	    	height = 500 - margin.top - margin.bottom;
	    var parseDate = d3.time.format("%Y%m%d").parse;
	    var x = d3.time.scale()
	    .range([0, width])
	    .nice();

		var y = d3.scale.linear()
		    .range([height, 0]);

		var color = d3.scale.category10();
		color.domain(data);
		/*var color = d3.scale.ordinal()
							.domain(data)
							.range([{color: "red", opacity: .1}, {color: "green", opacity: 1}]);*/

		var xAxis = d3.svg.axis()
		    .scale(x)
		    .orient("bottom");
		    //.ticks(20);

		var yAxis = d3.svg.axis()
		    .scale(y)
		    .orient("left");

		var line = d3.svg.line()
		    .interpolate("basis")
		    .x(function(d) { 
		    	return x(d[0]); })
		    .y(function(d) { 
		    	return y(d[1]); });

		//Calculate Max values for scales
	    var maxX=[];
	    for (node in data){
	    	for (type in data[node]){
	    		maxX.push(d3.max(data[node][type], function(d) {
		  			return d[1]; }))
	    	}
	    }

		x.domain(d3.extent(data[0][0], function(d) {
		  	return d[0]; }));
    	y.domain([0,d3.max(maxX)])
    	  	.nice();


    	var lineChart = d3.select("body").append("div")
    	  .attr("id","lineChart")
		//INPUT
		var svgInput = lineChart.append("svg")
			.attr("id","input")
		    .attr("width", width + margin.left + margin.right)
		    .attr("height", height + margin.top + margin.bottom)
		  .append("g")
		    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

		  svgInput.append("g")
		      .attr("class", "x axis")
		      .attr("transform", "translate(0," + height + ")")
		      .call(xAxis);

		  svgInput.append("g")
		      .attr("class", "y axis")
		      .call(yAxis)
		    .append("text")
		      .attr("transform", "rotate(-90)")
		      .attr("y", 6)
		      .attr("dy", ".71em")
		      .style("text-anchor", "end")
		      .text("Gb/s");

		  var inputNode = svgInput.selectAll(".node")
		      .data(data)
		    .enter().append("g")
		      .attr("class",function(d,i){ return "node" + i + " node";})
		      .attr("id", function(d,i){ return "input"+i });

		  inputNode.append("path")
		      .attr("class", function(d,i){ return "line " + "line" + i})
		      .attr("d", function(d) { 
		      	return line(d[0]); })
		      .style("stroke", function(d,i) { 
		      	return color(data[i]); 
		      })
		      .on('mouseover', function(d){
		      	//Difuse other lines fading away with a transition
		      	d3.selectAll(".node")
		      	  .transition()
                  .duration(1000)
                  .style("opacity", 0.2)
		      	//Length of path for the animation http://bl.ocks.org/duopixel/4063326
		      	var totalLength = this.getTotalLength();
    			//We animate the selected path
    			d3.selectAll("."+this.classList[1])
    				.attr("stroke-dasharray", totalLength + " " + totalLength)
      				.attr("stroke-dashoffset", totalLength)
      				.transition()
        			.duration(4000)
       				.ease("linear")
        			.attr("stroke-dashoffset", 0)
        		//We set the opacity of the animated path to one again so that it pops out.
        		d3.selectAll(".node"+this.classList[1].split('line')[1])
        		  .transition()
                  .duration(1000).style("opacity", 1)
			  })

		//INPUT
		var svgOutput = lineChart.append("svg")
			.attr("id","output")
		    .attr("width", width + margin.left + margin.right)
		    .attr("height", height + margin.top + margin.bottom)
		  .append("g")
		    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

		  svgOutput.append("g")
		      .attr("class", "x axis")
		      .attr("transform", "translate(0," + height + ")")
		      .call(xAxis);

		  svgOutput.append("g")
		      .attr("class", "y axis")
		      .call(yAxis)
		    .append("text")
		      .attr("transform", "rotate(-90)")
		      .attr("y", 6)
		      .attr("dy", ".71em")
		      .style("text-anchor", "end")
		      .text("Gb/s");

		  var outputNode = svgOutput.selectAll(".node")
		      .data(data)
		    .enter().append("g")
		      .attr("class",function(d,i){ return "node" + i + " node";})
		      .attr("id", function(d,i){ return "output"+i });

		  outputNode.append("path")
		      .attr("class", function(d,i){ return "line " + "line" + i})
		      .attr("d", function(d) { 
		      	return line(d[1]); })
		      .style("stroke", function(d,i) { return color(data[i]); })
		       .on('mouseover', function(d){
		      	//Difuse other lines fading away with a transition
		      	d3.selectAll(".node")
		      	  .transition()
                  .duration(1000)
                  .style("opacity", 0.2)
		      	//Length of path for the animation http://bl.ocks.org/duopixel/4063326
		      	var totalLength = this.getTotalLength();
    			//We animate the selected path
    			d3.selectAll("."+this.classList[1])
    				.attr("stroke-dasharray", totalLength + " " + totalLength)
      				.attr("stroke-dashoffset", totalLength)
      				.transition()
        			.duration(4000)
       				.ease("linear")
        			.attr("stroke-dashoffset", 0)
        		//We set the opacity of the animated path to one again so that it pops out.
        		d3.selectAll(".node"+this.classList[1].split('line')[1])
        		  .transition()
                  .duration(1000).style("opacity", 1)
			  })
	}
}