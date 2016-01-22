function histogramTableGraph(){	
	function histogram(data,bins){
	    //Number of bins
	    var inputDataLayouts = [];
	    var outputDataLayouts = [];
	    for (j=0;j<data.length;j++){
	      inputDataLayouts.push(d3.layout.histogram().bins(bins)(data[j][0]));
	      outputDataLayouts.push(d3.layout.histogram().bins(bins)(data[j][1]));
	    }
	    //Calculate Max values for scales
	    var maxX=[];
	    var maxY=[];
	    for (each in data){
	    	maxX.push(d3.max([d3.max(data[each][0]),d3.max(data[each][1])]));
			maxY.push(d3.max(inputDataLayouts[each], function(d) { return d.y; }));
	    	maxY.push(d3.max(outputDataLayouts[each], function(d) { return d.y; }));
	    }
	   	var maxX=d3.max(maxX);
	   	var maxY=d3.max(maxY);
	    // A formatter for counts.
	    //var formatCount = d3.format(",.0f");

	    var margin = {top: 4, right: 15, bottom: 16, left: 15, nameLeft:30, histogramLeft: 0},
	        width = 350 - margin.left - margin.right,
	        height = 100 - margin.top - margin.bottom;

	    var x = d3.scale.linear()
	        .domain([0, maxX])
	        .range([0, width])
	        .nice();

	    var y = d3.scale.linear()
	        .domain([0, maxY])
	        .range([height, 0]);

	    var xAxis = d3.svg.axis()
	        .scale(x)
	        .orient("bottom");

	    var yAxis = d3.svg.axis()
	      	.scale(y)
	      	.orient("left");
	    
	    //Input
		var svg=d3.selectAll(".col1").append("svg")
		   	.attr({
		      "width": width + margin.left + margin.right,
		      "height": height + margin.top + margin.bottom,
		    })
	    var graph = svg.append("g")
	        .attr("class", "graph")
	        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
	    var bar = graph.append("g")
	        .attr("class", "histogram")
	        .selectAll(".bar")
	        .data(function(d,i){ 
	        	console.log(i);
	        	return inputDataLayouts[i];
	        })
	        .enter().append("g")
	        .attr("class", "bar")
	        .attr("transform", function(d) { 
	        	return "translate(" + x(d.x) + "," + y(d.y) + ")"; });
	    bar.append("rect")
	        .attr("x", 1)
	        .attr("width", function(d,i){ 
	          return x(d.dx) - 1})
	        .attr("height", function(d) { return height - y(d.y); });
	    /*bar.append("text")
	        .attr("dy", ".75em")
	        .attr("y", 6)
	        .attr("x", x(dataLayouts[i][0].dx) / 2)
	        .attr("text-anchor", "middle")
	        .text(function(d) { 
	          return formatCount(d.y); });*/
	    graph.append("g")
	      .attr("class", "xAxis")
	      .attr("transform", "translate(0," + height + ")")
	      .call(xAxis);

	    //Output
		var svg=d3.selectAll(".col2").append("svg")
		   	.attr({
		      "width": width + margin.left + margin.right,
		      "height": height + margin.top + margin.bottom,
		    })
	    var graph = svg.append("g")
	        .attr("class", "graph")
	        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
	    var bar = graph.append("g")
	        .attr("class", "histogram")
	        .selectAll(".bar")
	        .data(function(d,i){ return outputDataLayouts[i]})
	        .enter().append("g")
	        .attr("class", "bar")
	        .attr("transform", function(d) { 
	        	return "translate(" + x(d.x) + "," + y(d.y) + ")"; });
	    bar.append("rect")
	        .attr("x", 1)
	        .attr("width", function(d,i){ 
	          return x(d.dx) - 1})
	        .attr("height", function(d) { return height - y(d.y); });
	    /*bar.append("text")
	        .attr("dy", ".75em")
	        .attr("y", 6)
	        .attr("x", x(dataLayouts[i][0].dx) / 2)
	        .attr("text-anchor", "middle")
	        .text(function(d) { 
	          return formatCount(d.y); });*/
	    graph.append("g")
	      .attr("class", "xAxis")
	      .attr("transform", "translate(0," + height + ")")
	      .call(xAxis);
	}

	function table(columns,elements,data){
		d3.select("body").append("div")
			.attr("id","multipleHistogram");
		var table = d3.select("#multipleHistogram").append("table")
			thead = table.append("thead"),
		    tbody = table.append("tbody");

		thead.append("tr")
			 .selectAll("th")
			 .data(columns).enter()
			 .append("th")
			 .text(function(d) { 
			 	return d; 
			 });

		var rows = tbody.selectAll("tr")
	        .data(elements)
	        .enter()
	        .append("tr")
	        .attr("id", function(d,i){return i })
	        .style("background-color", function(d,i){
	        	return ((i % 2 == 0) ? "rgba(63, 191, 127, 0.4)" : "rgba(63, 191, 127, 0.2)");});

	    var cells = rows.selectAll("td")
	        .data(columns)
	        .enter()
	        .append("td")
	        .attr("class", function(d,i){return "col" + i})
	        .attr("id",function(d,i){ 
	        	return this.parentElement.id + "-" +i;})
	    var selector = d3.selectAll(".col0")
	    	.append("input")
	    	.attr({
	    		"type":"checkbox",
	    		"name": function(d,i) { return (i)},
	    		"value": function(d,i) { return (i)},
	    		"checked":"checked"
	    	})
	    var names = d3.selectAll(".col0")
	    	.append("text")
	    	.text(function(d,i){return elements[i]})
	   	histogram(data,40);
	  
	}
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
			for (each in tsdsObjects){
				histogramData.push(parseHistogram(tsdsObjects[each]));
			}
			table(["Link","Input", "Output"],["US LHCNet","ASGCNet","CSTNet","TransPAC3","AARNet"],histogramData)
		});
	}
	//Variable to hold the data from query to TSDS and that will be passed to the different graph functions
	parseQuery();
}