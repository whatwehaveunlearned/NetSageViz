function histogramTableGraph(data){
	//#################################### AUX FUNCTIONS ############################
	//#################################### END AUX FUNCTIONS ########################
	function histogram(data,bins){
	    function createLegend(type){
	    	var histoLegend = graph.append("g")
						    	.attr({
						    		class: "histoLegend",
						    		transform:  "translate(" + histogramLegend.width + "," + histogramLegend.height + ")"
						    	})
						    	.append("text");
	    	histoLegend.append("tspan")
	    			   .attr({
	    			   		x:0,
	    			   		class: "max"
	    				})
	    			   .text(function(d,i){
	    						return "Max: " + eval("data[i]." + type + ".max.toFixed(2)")
	    				});
	    	histoLegend.append("tspan")
	    			   .attr({
	    			   		class: "avg",
	    			   		x:0,
	    			   		dy: 15
	    				})
	    			   .text(function(d,i){
	    						return "Avg: " + eval("data[i]." + type + ".avg.toFixed(2)")
	    				});
	    	histoLegend.append("tspan")
	    			   .attr({
	    			   		class: "min",
	    			   		x:0,
	    			   		dy: 15
	    				})
	    			   .text(function(d,i){
	    						return "Min: " + eval("data[i]." + type + ".min.toFixed(2)")
	    				});
	    }
	    //Number of bins
	    var inputDataLayouts = [];
	    var outputDataLayouts = [];
	    for (j=0;j<data.length;j++){
	      inputDataLayouts.push(d3.layout.histogram().bins(bins)(data[j].input.histogram));
	      outputDataLayouts.push(d3.layout.histogram().bins(bins)(data[j].input.histogram));
	    }
	    //Calculate Max values for scales
	    var maxX=[];
	    var maxY=[];
	    for (each in data){
	    	maxX.push(d3.max([d3.max(data[each].input.histogram),d3.max(data[each].input.histogram)]));
			maxY.push(d3.max([d3.max(inputDataLayouts[each], function(d) { return d.y; }),d3.max(outputDataLayouts[each], function(d) { return d.y; })]));
	    }
	   	var maxX=d3.max(maxX);
	   	var maxY=d3.max(maxY);

	    var margin = {top: 2, right: 15, bottom: 16, left: 15, nameLeft:30, histogramLeft: 0},
	        width = 350 - margin.left - margin.right,
	        height = 100 - margin.top - margin.bottom;
	    var histogramLegend = {width:width-50,height:16}
	    //Set up scales
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

	    graph.append("g")
	      .attr("class", "xAxis")
	      .attr("transform", "translate(0," + height + ")")
	      .call(xAxis);

	    createLegend("input");


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

	    graph.append("g")
	      .attr("class", "xAxis")
	      .attr("transform", "translate(0," + height + ")")
	      .call(xAxis);

		createLegend("output");
	    //Converto to dragtable
	    $('table').dragtable();
	}

	function table(columns,data,bins){
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
	        .data(data)
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
	    	.text(function(d,i){return data[i].node});
	   	histogram(data,bins);
	}

	function parseQuery(){
		function scaleAndClean (dataPoint,avgOver){
			var inputClean=[];
			var outputClean=[];
			for (each in dataPoint.input){
				if(dataPoint.input[each][1]!=null) inputClean.push(dataPoint.input[each][1]/8/1024/1024); // bit/bytes/Kbs/Mbs/Gbs
				if(dataPoint.output[each][1]!=null) outputClean.push(dataPoint.output[each][1]/8/1024/1024);
			}
			//Save the cleaned scaled values in the data
			dataPoint.input.histogram = inputClean;
			dataPoint.output.histogram = outputClean;
			//Create other helper Statistical values
			dataPoint.input.max = d3.max(inputClean);
			dataPoint.input.min = d3.min(inputClean);
			dataPoint.input.avg = avg(inputClean);
			dataPoint.input.median = median(inputClean);
			dataPoint.input.percentile25 = percentile(inputClean,25);
			dataPoint.input.percentile75 = percentile(inputClean,75);
			dataPoint.input.totaldata = avg(inputClean)*avgOver;
			dataPoint.output.avg = avg(outputClean);
			dataPoint.output.median = median(outputClean);
			dataPoint.output.percentile25 = percentile(outputClean,25);
			dataPoint.output.percentile75 = percentile(outputClean,75);
			dataPoint.output.max = d3.max(outputClean);
			dataPoint.output.min = d3.min(outputClean);
			dataPoint.output.totaldata = avg(outputClean)*avgOver;
		}

		function bins(data,type){
			var bins;
			switch(type){
				case "sqrRoot":
					bins = Math.ceil(Math.sqrt(data[0].input.length));
					break;
				case "rice":
					bins = Math.ceil(2 * Math.pow(data[0].input.length, 1/3));
					break;
				case "fd":
					bins = Math.ceil(2 * (data[0].input.percentile75 - data[0].input.percentile25)/ Math.pow(data[0].input.length, 1/3));
					break;
				default://Sturges
					bins= Math.ceil(Math.log2(data[0].input.length+1));
					break;
			}
			return bins;
		}
		//Prepare data for histograms
		var avgOver = 3600;
		var histogramData = [];
		var bins;
		for (element in data){
			scaleAndClean(data[element],avgOver);
		}
		bins = bins(data,"fd");
		//Order the data
		data = sortObjects(data);
		table(["Link","Input", "Output"],data,bins)
	}
	//#################################### END AUX FUNCTIONS ############################
	parseQuery(data);
}