//#################################### HISTOGRAM TABLE GRAPH FUNCTION ###########################
//This funtion wraps all the functions needed to paint the histogram table, creates the bins for the data and the dimension of the graph then it calles table function.
function histogramTableGraph(data){
	function handleMouseOver(d,i){
			linkColor = d3.select("#link"+this.id)[0][0].style["stroke"]
    		d3.select("#link"+this.id)
    		 	.style("stroke", "red");
    	}
    	function handleMouseOut(d,i){
			d3.select("#link"+this.id)
    		  	.style("stroke", linkColor);
		}
	//Hold the initial link color before selection
	var linkColor;
	//Prepare data for histograms
	var histogramData = [];
	var bins;
	bins = bins(data,"fd");
	//Order the data
	data = sortObjects(data);
	// Create margins
    var margin = {top: 2, right: 15, bottom: 16, left: 15, nameLeft:30, histogramLeft: 0},
    width = 350 - margin.left - margin.right,
    height = 100 - margin.top - margin.bottom;
    var columns = ["Link","Input Bandwidth", "Output Bandwidth","Total Data"];
    //Create header of the Table, and row per data element. Creates the barebones of an html table that will fil up with the rest of the functions
    d3.select("body").append("div")
			.attr("id","multipleHistogram");
		var hisTable = d3.select("#multipleHistogram").append("table")
			thead = hisTable.append("thead"),
		    tbody = hisTable.append("tbody");
		var header = thead.append("tr");
		var rows = tbody.selectAll("tr")
	        .data(data)
	        .enter()
	        .append("tr")
	        .attr("id", function(d,i){return i })
	        .style("background-color", function(d,i){
	        	return ((i % 2 == 0) ? "rgba(63, 191, 127, 0.4)" : "rgba(63, 191, 127, 0.2)");})
	       	.on("mouseover",handleMouseOver)
	       	.on("mouseout",handleMouseOut);
	//Fill nodes data
	dataGroup(0,columns,data,bins);
	//Fill Links data
	dataGroup(1,["Link","Input Bandwidth", "Output Bandwidth","Total"],data,bins);
	//We will add domains, insitutions columns here in the future...
	//Converto to dragtable
	$('table').dragtable();

	//#################################### AUX FUNCTIONS ###########################
	//############### Function to create custom binnings for the data ###############
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
	//###############Function that adds columns headers and corresponding cells (columns per each row) ###############
	function dataGroup(group,columns,data,bins){
		var data = data;
		var group = group;
		header.selectAll(".head"+group)
			.data(columns)
			.enter()
			.append("th")
			.attr({
				"class": function(d,i){
					return "head" + group;},
			})
			.text(function(d) {
			 	return d;
			 });
	    var cells = rows.selectAll(".col"+ i + "-" + group)
	        .data(columns)
	        .enter()
	        .append("td")
	        .attr({
	        	"class": function(d,i){return "col" + group + "-" + i;}, //class: group-column
	        	"id": function(d,i){ return group + "-" + this.parentElement.id + "-" + i;} //id: group-column-cell
	        })
		var selector = d3.selectAll(".col" + group + "-" + 0)
		    .append("input")
		    .attr({
	    		"type":"checkbox",
	    		"name": function(d,i) { return (i)},
	    		"value": function(d,i) { return (i)},
	    		"checked":"checked"
	    	})
		var names = d3.selectAll(".col" + group + "-" + 0)
	    	.append("text")
	    	.text(function(d,i){return data[i].node});
	    //FillTable
	   	fillTable(group,data,bins,columns);
	}
	//############### Function to fill the formatted data for each column ###############
	function fillTable(group,data,bins,columns){
		var data = data;
		var bins = bins;
		var columns = columns;
		//Create Input and OutputHistogram
	    createHistogram(group);
	    //TotalData
	    createTotalData(group);
	}
	//############### Function to draw total data column ###############
	function createTotalData(group){
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
		   		div.html("<p>"+ d[1].toFixed(2) +" GB</p> <p>"+ (100*d[1]/totalDataOut).toFixed(2) + " %" )
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

	    var svg=d3.selectAll(".col" + group + "-3").append("svg")
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
			  .on("mouseout",handleMouseOut)
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
	//############### Function to create the histogram ###############
	function createHistogram(group){
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
		    fillHistogramColumn(".col"+ group + "-1","inputDataLayouts","input",inputDataLayouts,outputDataLayouts,x,y,xAxis);
		    //Output
		    fillHistogramColumn(".col"+ group + "-2","outputDataLayouts","output",outputDataLayouts,outputDataLayouts,x,y,xAxis);
	}
	//############### function to draw the histogram Column ###############
    function fillHistogramColumn(colName,colData,legend,inputDataLayouts,outputDataLayouts,x,y,xAxis,yAxis){
		function handleMouseOver(d,i){
			div = d3.select("#tableTooltip");
			div.transition()
					.duration(200)
					.style("opacity", .9);
		   	div.html("<p>"+ avg(d).toFixed(2) +" MB/s</p> <p>"+ d.length + " elements" )
		       .style("left", (d3.event.pageX + 5) + "px")
		       .style("top", (d3.event.pageY - 28) + "px");
		}
		function handleMouseOut(d,i){
	    	div = d3.select("#tableTooltip");
	    	div.transition()
	       .duration(500)
	       .style("opacity", 0);
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
	    						return "Max: " + eval("data[i]." + type + ".max.toFixed(2)") + " MB/s"
	    				});
	    	histoLegend.append("tspan")
	    			   .attr({
	    			   		class: "avg",
	    			   		x:-15,
	    			   		dy: 15
	    				})
	    			   .text(function(d,i){
	    						return "Avg: " + eval("data[i]." + type + ".avg.toFixed(2)") + " MB/s"
	    				});
	    	histoLegend.append("tspan")
	    			   .attr({
	    			   		class: "min",
	    			   		x:-15,
	    			   		dy: 15
	    				})
	    			   .text(function(d,i){
	    						return "Min: " + eval("data[i]." + type + ".min.toFixed(2)")+ " MB/s"
	    				});
		}
		var x = x;
		var y = y;
		var inputDataLayouts = inputDataLayouts;
		var outputDataLayouts = outputDataLayouts;
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
	        .on("mouseover",handleMouseOver)
		  	.on("mouseout",handleMouseOut)

	    graph.append("g")
	      .attr("class", "xAxis")
	      .attr("transform", "translate(0," + height + ")")
	      .call(xAxis);

	    createLegend(legend);
	}
	//#################################### END AUX FUNCTIONS ###########################
}