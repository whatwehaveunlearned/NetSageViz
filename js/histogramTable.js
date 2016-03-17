function histogramTableGraph(data,sizeInterval){
	//#################################### AUX FUNCTIONS histogramTable ############################
	function fillTable(data,bins,columns){
		//#################################### AUX FUNCTIONS fillTable ############################
		function createHistogram(){
		    function fillHistogramColumn(colName,colData,legend){
		    	function handleMouseOver(d,i){
		    		div = d3.select("#tableTooltip");
	    			div.transition()
	       				.duration(200)
	       				.style("opacity", .9);
	       			if(this.classList[0]=="iData"){
	       				div.html("<p>"+ d[0].toFixed(2) +" GB</p> <p>"+ (100*d[0]/totalDataIn).toFixed(2) + " %" )
				       .style("left", (d3.event.pageX + 5) + "px")
				       .style("top", (d3.event.pageY - 28) + "px");
				   }else if(this.classList[0]=="oData"){
				   		div.html("<p>"+ d[1].toFixed(2) +" GB</p> <p>"+ (100*d[1]/totalDataIn).toFixed(2) + " %" )
				       .style("left", (d3.event.pageX + 5) + "px")
				       .style("top", (d3.event.pageY - 28) + "px");
				   }
				   else{
				   	div.html("<p>"+ avg(d).toFixed(2) +" MB/s</p> <p>"+ d.length + " elements" )
				       .style("left", (d3.event.pageX + 5) + "px")
				       .style("top", (d3.event.pageY - 28) + "px");
				   }
		    	}
		    	function createLegend(type){
		    		var histogramLegend = {width:width-50,height:16}
			    	var histoLegend = graph.append("g")
								    	.attr({
								    		class: "histoLegend",
								    		transform:  "translate(" + histogramLegend.width + "," + histogramLegend.height + ")"
								    	})
								    	.append("text");
			    	histoLegend.append("tspan")
			    			   .attr({
			    			   		x:-15,
			    			   		class: "max"
			    				})
			    			   .text(function(d,i){
			    						return "Max: " + eval("data[i]." + type + ".max.toFixed(2)") + " Mb/s"
			    				});
			    	histoLegend.append("tspan")
			    			   .attr({
			    			   		class: "avg",
			    			   		x:-15,
			    			   		dy: 15
			    				})
			    			   .text(function(d,i){
			    						return "Avg: " + eval("data[i]." + type + ".avg.toFixed(2)") + " Mb/s"
			    				});
			    	histoLegend.append("tspan")
			    			   .attr({
			    			   		class: "min",
			    			   		x:-15,
			    			   		dy: 15
			    				})
			    			   .text(function(d,i){
			    						return "Min: " + eval("data[i]." + type + ".min.toFixed(2)")+ " Mb/s"
			    				});
		    	}
		    	var svg=d3.selectAll(colName).append("svg")
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
			        	return eval((colData) + "[" + i + "]");
			        })
			        .enter().append("g")
			        .attr("class", "bar")
			        .attr("transform", function(d) {
			        	return "translate(" + x(d.x) + "," + y(d.y) + ")"; });
			    bar.append("rect")
			        .attr("x", 1)
			        .attr("width", function(d,i){
			          return x(d.dx) - 1})
			        .attr("height", function(d) { return height - y(d.y); })
			        .on("mouseover",handleMouseOver);

			    graph.append("g")
			      .attr("class", "xAxis")
			      .attr("transform", "translate(0," + height + ")")
			      .call(xAxis);

			    createLegend(legend);
		    }
		    //Number of bins
		    var inputDataLayouts = [];
		    var outputDataLayouts = [];
		    for (j=0;j<data.length;j++){
		      inputDataLayouts.push(d3.layout.histogram().bins(bins)(data[j].input.histogram));
		      outputDataLayouts.push(d3.layout.histogram().bins(bins)(data[j].output.histogram));
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
		    fillHistogramColumn(".col1","inputDataLayouts","input");
		    //Output
		    fillHistogramColumn(".col2","outputDataLayouts","output");
	    }
	    function createTotalData(){
	    	function handleMouseOver(d,i){
	    		div = d3.select("#tableTooltip");
    			div.transition()
       				.duration(200)
       				.style("opacity", .9);
       			if(this.classList[0]=="iData"){
       				div.html("<p>"+ d[0].toFixed(2) +" GB</p> <p>"+ (100*d[0]/totalDataIn).toFixed(2) + " %" )
			       .style("left", (d3.event.pageX + 5) + "px")
			       .style("top", (d3.event.pageY - 28) + "px");
			   }else{
			   		div.html("<p>"+ d[1].toFixed(2) +" GB</p> <p>"+ (100*d[1]/totalDataIn).toFixed(2) + " %" )
			       .style("left", (d3.event.pageX + 5) + "px")
			       .style("top", (d3.event.pageY - 28) + "px");
			   }
	    	}
	    	function handleMouseOut(d,i){
    		    div = d3.select("#tableTooltip");
			    div.transition()
			       .duration(500)
			       .style("opacity", 0);
	    	}
	    	// Define the div for the tooltip
			var div = d3.select("body").append("div")
			    .attr("id", "tableTooltip")
			    .style("opacity", 0);
	    	var barwidth = 15;
	    	var position = {position1: height/4 , position2: height - height/3}

	    	//Calculate Max values for scales and Total data transmitted accross all elements
		    var totalDataIn=0, totalDataOut=0;
		    for (each in data){
		    	totalDataIn += data[each].totalData[0];
		    	totalDataOut += data[each].totalData[1];
		    }
		   	var maxX = d3.max([totalDataIn,totalDataOut]);

		    //Set up scales
		    var x = d3.scale.linear()
		        .domain([0, maxX])
		        .range([0, width])
		        .nice();

		    var xAxis = d3.svg.axis()
		        .scale(x)
		        .orient("bottom");

		    var svg=d3.selectAll(".col3").append("svg")
			   		.attr({
			      		"width": width + margin.left * 3 + margin.right,
			      		"height": height + margin.top + margin.bottom,
			    	})
		    var graph = svg.append("g")
			        .attr("class", "graph")
			        .attr("transform", "translate(" + margin.left * 3 + "," + margin.top + ")");
		    //totalInput
		    var totalInput = graph.append("g")
		        .attr("class", "totalInput");
		    totalInput.append("rect")
		    	.attr("transform", "translate(0," + position.position1 + ")")
				  .attr("height", barwidth)
				  .attr("class","totalDataBar")
				  .attr("width", function(d){
				    return x(totalDataIn);
				  })
		    totalInput.selectAll(".bar")
		        .data(function(d,i){
		        	return [eval("data[" + i + "].totalData")];
		        })
		    	.enter().append("rect")
		    	.attr("class","iData")
				  .attr("transform", "translate(0," + position.position1 + ")")
				  .attr("height", barwidth)
				  .attr("width", function(d){
				    return x(d[0]);
				  })
				  .on("mouseover",handleMouseOver)
			totalInput.append("text")
		      .attr("x", -40)
		      .attr("y", position.position1)
		      .attr("dy", barwidth/2)
		      .text(function(d) { return "Input"; });
		    totalInput.append("text")
		      .attr("x", x(totalDataIn) - 3 * margin.left)
		      .attr("y", position.position1 - barwidth)
		      .attr("dy", barwidth/2)
		      .text(function(d,i) {
		      	return (totalDataIn/1024).toFixed(2) + " GBs"; });
			//totalOutput
			var totalOutput = graph.append("g")
		        .attr("class", "totalOuput")
		    totalOutput.append("rect")
		    	.attr("class","oData")
		    	.attr("transform", "translate(0," + position.position2+ ")")
				  .attr("height", barwidth)
				  .attr("class","totalDataBar")
				  .attr("width", function(d){
				    return x(totalDataOut);
				  })
		    totalOutput.selectAll(".bar")
		        .data(function(d,i){
		        	return [eval("data[" + i + "].totalData")];
		        })
		    	.enter().append("rect")
				  .attr("transform", "translate(0," + position.position2 + ")")
				  .attr("height", barwidth)
				  .attr("width", function(d){
				    return x(d[1]);
				  })
				  .on("mouseover",handleMouseOver)
				  .on("mouseout",handleMouseOut)
			totalOutput.append("text")
		      .attr("x", -40)
		      .attr("y", position.position2)
		      .attr("dy", barwidth/1.5)
		      .text(function(d) { return "Output"; });
		    totalOutput.append("text")
		      .attr("x", x(totalDataOut) - 3 * margin.left)
		      .attr("y", position.position2 - barwidth)
		      .attr("dy", barwidth/2)
		      .text(function(d,i) {
		      	return (totalDataOut/1024).toFixed(2) + " GBs"; });

	    }
	    //#################################### END AUX FUNCTIONS createHistogram ########################
	    var margin = {top: 2, right: 15, bottom: 16, left: 15, nameLeft:30, histogramLeft: 0},
	        width = 350 - margin.left - margin.right,
	        height = 100 - margin.top - margin.bottom;
	    //Create Input and OutputHistogram
	    createHistogram();
	    //TotalData
	    createTotalData();
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
	   	//Converto to dragtable
	    $('table').dragtable();
	    //FillTable
	   	fillTable(data,bins,columns);
	}

	function parseQuery(){
		function scaleAndClean (dataPoint,sizeInterval){
			var inputClean=[];
			var outputClean=[];
			for (each in dataPoint.input){
				if(dataPoint.input[each][1]!=null) inputClean.push(dataPoint.input[each][1]/8/1024/1024); // bit/bytes/KBs/MBs/
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
			dataPoint.output.avg = avg(outputClean);
			dataPoint.output.median = median(outputClean);
			dataPoint.output.percentile25 = percentile(outputClean,25);
			dataPoint.output.percentile75 = percentile(outputClean,75);
			dataPoint.output.max = d3.max(outputClean);
			dataPoint.output.min = d3.min(outputClean);
			dataPoint.totalData = [avg(inputClean)*sizeInterval,avg(outputClean)*sizeInterval];
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
		var histogramData = [];
		var bins;
		for (element in data){
			scaleAndClean(data[element],sizeInterval);
		}
		//Remove the empty value THIS IS TEMPORAL HACK!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
		data.splice(5,1);
		bins = bins(data,"fd");
		//Order the data
		data = sortObjects(data);
		table(["Link","Input Bandwidth", "Output Bandwidth","Total Data"],data,bins)
	}
	//#################################### END AUX FUNCTIONS ############################
	var sizeInterval = sizeInterval;
	parseQuery(data,sizeInterval);
}