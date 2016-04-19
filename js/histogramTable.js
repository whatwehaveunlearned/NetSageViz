//#################################### HISTOGRAM TABLE GRAPH FUNCTION ###########################
//This funtion wraps all the functions needed to paint the histogram table, creates the bins for the data and the dimension of the graph then it calles table function.
function histogramTableGraph(queryData){
	//Hold the initial link color before selection
	var linkColor;
	var bins;
	var columns;
	// Create margins
    var margin = {top: 2, right: 15, bottom: 16, left: 15, nameLeft:30, histogramLeft: 0},
    	width = 350 - margin.left - margin.right,
   		height = 100 - margin.top - margin.bottom;
	//Order the data and launch tables
	links = sortObjects(queryData.links);
	nodes = sortObjects(queryData.nodes);
	columns = ["Links","Incoming Bandwidth", "Outgoing Bandwidth","Total Data"];
    startTable("links-"+counter,links);
    columns = ["Nodes","Incoming Bandwidth", "Outgoing Bandwidth","Total Data"];
    startTable("nodes-"+counter,nodes);
	//Converto to dragtable
	$('table').dragtable();

	//#################################### AUX FUNCTIONS ###########################
	//############### Function to create custom binnings for the data ###############
	function createBins(data,type){
		var bins;
		switch(type){
			case "sqrRoot":
				bins = Math.ceil(Math.sqrt(data[0].data.input.histogram.length));
				break;
			case "rice":
				bins = Math.ceil(2 * Math.pow(data[0].data.input.histogram.length, 1/3));
				break;
			case "fd":
				bins = Math.ceil(2 * (data[0].data.input.percentile75 - data[0].data.input.percentile25)/ Math.pow(data[0].data.input.histogram.length, 1/3));
				break;
			default://Sturges
				bins= Math.ceil(Math.log2(data[0].data.input.histogram.length+1));
				break;
		}
		return bins;
	}
	//function to Create header of the Table, and row per data element. Creates the barebones of an html table that will fill up with the rest of the functions
	function startTable(tableName,data){
		function handleMouseOverRow(d,i){
			if(this.classList[0]=="links"){
				linkColor = d3.select("#" + this.classList[0] + this.id)[0][0].style["stroke"]
    			d3.select("#" + this.classList[0] + this.id)
    		 		.style("stroke", "red");
    		}else{
    			var nodeLinks="";
    			 //Change size of node
			    d3.select("#nodes"+this.id)
			      .transition()
			      .duration(500)
			      .style('stroke','rgba(232, 157, 77, 0.9)')
			      .style('stroke-width','2')
			      .attr('r',10)
			    div = d3.select("#mapTooltip");
			    div.transition()
			       .duration(500)
			       .style("opacity", 0);
			    div.transition()
			       .duration(500)
			       .style("opacity", .9);
			        //Get the text for the links
				    for (var each in d.links){
				      nodeLinks = nodeLinks + ("<p>" + links[d.links[each]].node + "- " + links[d.links[each]].intf + "</p>")
				    }
				    div.html("<p id ='mapTooltipname'>" + d.node + "</p>"+ nodeLinks )
				       .style("left", (d3.select("#nodes"+this.id).attr("cx") + 15) + "px")
				       .style("top", (d3.select("#nodes"+this.id).attr("cy") ) + "px");
  			}
    	}
    	function handleMouseOutRow(d,i){
    		if(this.classList[0]=="links"){
				d3.select("#" + this.classList[0] + this.id)
    		  		.style("stroke", linkColor);
    		}else{
    			//return events on lines
			    d3.selectAll(".links")
			      .attr("pointer-events","auto")
			    d3.select("#nodes"+this.id)
			      .transition()
			      .duration(500)
			      .style('stroke','black')
			      .style('stroke-width','1')
			      .attr('r',5)
			    var nodeLinks="";
			    div = d3.select("#mapTooltip");
			    div.transition()
			       .duration(1000)
			       .style("opacity", 0);
			}
		}
    	//Create bining for histogram
		bins = createBins(data,"fd");

	    d3.select("#query"+counter).append("div")
			.attr({
				"id":"multipleHistogram-" + tableName,
				"class":"multipleHistogram"
			});
		var hisTable = d3.select("#multipleHistogram-" + tableName).append("table")
			thead = hisTable.append("thead"),
		    tbody = hisTable.append("tbody");
		var header = thead.append("tr");
		var rows = tbody.selectAll("tr")
	        .data(data)
	        .enter()
	        .append("tr")
	        .attr({
	        	"id": function(d,i){
	        		return i },
	       		"class": tableName + " row"
	        	})
	        .style("background-color", function(d,i){ return ((i % 2 == 0) ? "rgba(63, 191, 127, 0.4)" : "rgba(63, 191, 127, 0.2)");})
	       	.on("mouseover",handleMouseOverRow)
	       	.on("mouseout",handleMouseOutRow);
	    // Define the div for the tooltip
		var div = d3.select("body").append("div")
		    .attr({
		    	"id": tableName+"-tableTooltip",
		    	"class": "tableTooltip"
		    })
		    .style("opacity", 0);
	    dataGroup(tableName,0,data,bins,header,rows);
	}
	//###############Function that adds columns headers and corresponding cells (columns per each row) ###############
	function dataGroup(tableName,group,data,bins,header,rows){
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
	    var cells = rows.selectAll()
	        .data(columns)
	        .enter()
	        .append("td")
	        .attr({
	        	"class": function(d,i){return tableName + "-" + group + "-col" + i;}, //class: tableName-group-column
	        	"id": function(d,i){ return tableName + "-" + group + this.parentElement.id + "-" + i;} //id: tableName-group-column-cell
	        })
		var selector = d3.selectAll(".col" + group + "-" + 0)
		    .append("input")
		    .attr({
	    		"type":"checkbox",
	    		"name": function(d,i) { return (i)},
	    		"value": function(d,i) { return (i)},
	    		"checked":"checked"
	    	})
		var names = d3.selectAll("." + tableName + "-" + group + "-col" + 0)
	    	.append("text")
	    	.text(function(d,i){
	    		return data[i].node});
	    //FillTable
	   	fillTable(tableName,group,data,bins,columns);
	}
	//############### Function to fill the formatted data for each column ###############
	function fillTable(tableName,group,data,bins){
		var bins = bins;
		//Create Input and OutputHistogram
	    createHistogram(tableName,group,data);
	    //TotalData
	    createTotalData(tableName,group,data);
	}
	//############### Function to draw total data column ###############
	function createTotalData(tableName,group,data){
    	function handleMouseOver(d,i){
    		div = d3.select("#" + tableName + "-tableTooltip");
			div.transition()
   				.duration(200)
   				.style("opacity", .9);
   			if(this.classList[1]=="iData"){
   				div.html("<p>"+ (eval(this.classList[0]+"[" + this.id.split("-")[2] + "].data.totalData[0]")/1024).toFixed(2) +" GB</p> <p>"+ (100 * eval(this.classList[0]+"[" + this.id.split("-")[2] + "].data.totalData[0]")/totalDataIn).toFixed(2) + " %" )
		       .style("left", (d3.event.pageX + 5) + "px")
		       .style("top", (d3.event.pageY - 28) + "px");
		   }else{
		   		div.html("<p>"+ (eval(this.classList[0]+"[" + this.id.split("-")[2] + "].data.totalData[1]")/1024).toFixed(2) +" GB</p> <p>"+ (100*eval(this.classList[0]+"[" + this.id.split("-")[2] + "].data.totalData[1]")/totalDataOut).toFixed(2) + " %" )
		       .style("left", (d3.event.pageX + 5) + "px")
		       .style("top", (d3.event.pageY - 28) + "px");
		   }
    	}
    	function handleMouseOut(d,i){
		    div = d3.select("#" + tableName + "-tableTooltip");
		    div.transition()
		       .duration(500)
		       .style("opacity", 0);
    	}
    	var barwidth = 15;
    	var position = {position1: height/4 , position2: height - height/3}

    	//Calculate Max values for scales and Total data transmitted accross all elements
	    var totalDataIn=0, totalDataOut=0;
	    for (each in data){
	    	totalDataIn += eval(tableName.split("-")[0] + "[each].data.totalData[0]");
	    	totalDataOut += eval(tableName.split("-")[0] + "[each].data.totalData[1]");
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

	    var svg=d3.selectAll("." + tableName + "-" + group + "-col" + "3").append("svg")
	   		.attr({
	      		"width": width + margin.left * 3 + margin.right,
	      		"height": height + margin.top + margin.bottom,
	    	})
	    var graph = svg.append("g")
	        .attr({
	        	"class": "graph",
	        	"transform": "translate(" + margin.left * 3 + "," + margin.top + ")"
	        });
	    //totalInput
	    var totalInput = graph.append("g")
	        .attr("class", tableName + " totalInput");
	    //Creates totalData input Bar
	    totalInput.append("rect")
	    	.attr({
	    		"transform": "translate(0," + position.position1 + ")",
			  	"height": barwidth,
			  	"class":"totalDataBar",
			  	"width": function(d){ return x(totalDataIn); }
			})
		//Fills up the totalDatabar input for each individual element
	    totalInput.append("rect")
	    	.attr({
	    		"class": tableName + " iData",
	    		"id": function(d,i){ return this.classList[0] + "-totalIn-" + i;},
				"transform": "translate(0," + position.position1 + ")",
				"height": barwidth,
				"width": function(d,i){ return x(eval(this.classList[0].split("-")[0]+"[i].data.totalData[0]")); }
			  })
			.on("mouseover",handleMouseOver)
			.on("mouseout",handleMouseOut)
		totalInput.append("text")
	      	.attr({
	      		"x": -40,
	      		"y": position.position1,
	      		"dy": barwidth/2
	      	})
	      	.text(function(d) { return "Input"; });
	    totalInput.append("text")
	      	.attr({
	      		"x": x(totalDataIn) - 3 * margin.left,
	      		"y": position.position1 - barwidth,
	      		"dy": barwidth/2
	      	})
	      	.text(function(d,i) { return (totalDataIn/1024).toFixed(2) + " GB"; } );
		//totalOutput
		var totalOutput = graph.append("g")
	        .attr("class", "totalOuput")
	    //Creates totalData input Bar
	    totalOutput.append("rect")
	    	.attr({
	    		"transform": "translate(0," + position.position2+ ")",
				"height": barwidth,
				"class": "totalDataBar",
				"width": function(d){ return x(totalDataOut);}
			})
		//Fills up the totalDatabar input for each individual element
	    totalOutput.append("rect")
	    	.attr({
	    	  	"class": tableName + " oData ",
	    	  	"id": function(d,i){ return this.classList[0] + "-totalOut-" + i;},
			  	"transform": "translate(0," + position.position2 + ")",
			  	"height": barwidth,
			  	"width": function(d,i){ return x(eval(this.classList[0].split("-")[0]+"[i].data.totalData[1]")); }
			})
			.on("mouseover",handleMouseOver)
			.on("mouseout",handleMouseOut)
		totalOutput.append("text")
	      	.attr({
	      		"x": -40,
	      		"y": position.position2,
	      		"dy": barwidth/1.5
	      	})
	      .text(function(d) { return "Output"; });
	    totalOutput.append("text")
	    	.attr({
	      		"x": x(totalDataOut) - 3 * margin.left,
	      		"y": position.position2 - barwidth,
	      		"dy": barwidth/2
	     	})
	     	.text(function(d,i) { return (totalDataOut/1024).toFixed(2) + " GB"; });
	}
	//############### Function to create the histogram ###############
	function createHistogram(tableName,group,data){
		    //Number of bins
		    var inputDataLayouts = [];
		    var outputDataLayouts = [];
		    for (j=0;j<data.length;j++){
		      inputDataLayouts.push(d3.layout.histogram().bins(bins)(data[j].data.input.histogram));
		      outputDataLayouts.push(d3.layout.histogram().bins(bins)(data[j].data.output.histogram));
		    }
		    //Calculate Max values for scales
		    var maxX=[];
		    var maxY=[];
		    for (each in data){
		    	maxX.push(d3.max([d3.max(data[each].data.input.histogram),d3.max(data[each].data.output.histogram)]));
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
		    fillHistogramColumn(tableName,"." + tableName + "-" + group + "-col1","inputDataLayouts","input",inputDataLayouts,outputDataLayouts,x,y,xAxis,yAxis,data);
		    //Output
		    fillHistogramColumn(tableName,"." + tableName + "-" + group + "-col2","outputDataLayouts","output",outputDataLayouts,outputDataLayouts,x,y,xAxis,yAxis,data);
	}
	//############### function to draw the histogram Column ###############
    function fillHistogramColumn(tableName,colName,colData,legend,inputDataLayouts,outputDataLayouts,x,y,xAxis,yAxis,data){
		function handleMouseOver(d,i){
			var dataInColumn=[];
			for (var i=0;i<d.y;i++){
				dataInColumn.push(d[i]);
			}
			div = d3.select("#" + tableName + "-tableTooltip");
			div.transition()
					.duration(200)
					.style("opacity", .9);
		   	div.html("<p>"+ avg(dataInColumn).toFixed(2) +" MB/s</p> <p>"+ d.y + " elements" )
		       .style("left", (d3.event.pageX + 5) + "px")
		       .style("top", (d3.event.pageY - 28) + "px");
		}
		function handleMouseOut(d,i){
	    	div = d3.select("#" + tableName + "-tableTooltip");
	    	div.transition()
	       .duration(500)
	       .style("opacity", 0);
		}
		function createLegend(tableName,type,data){
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
	    			   		class: tableName + " max",
	    			   		id: function(d,i){ return i;}
	    				})
	    				.text(function(d,i){
	    						return "Max: " + eval(this.classList[0].split("-")[0] + "[i].data." + type + ".max.toFixed(2)") + " MB/s"
	    				});
	    	histoLegend.append("tspan")
	    			   .attr({
	    			   		class: tableName + " avg",
	    			   		x:-15,
	    			   		dy: 15
	    				})
	    			   .text(function(d,i){
	    						return "Avg: " + eval(this.classList[0].split("-")[0] + "[i].data." + type + ".avg.toFixed(2)") + " MB/s"
	    				});
	    	histoLegend.append("tspan")
	    			   .attr({
	    			   		class: tableName + " min",
	    			   		x:-15,
	    			   		dy: 15
	    				})
	    			   .text(function(d,i){
	    						return "Min: " + eval(this.classList[0].split("-")[0] + "[i].data." + type + ".min.toFixed(2)")+ " MB/s"
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
	        .on("mouseover",handleMouseOver)
		  	.on("mouseout",handleMouseOut)

	    graph.append("g")
	      .attr("class", "xAxis")
	      .attr("transform", "translate(0," + height + ")")
	      .call(xAxis);

	    createLegend(tableName,legend,data);
	}
	//#################################### END AUX FUNCTIONS ###########################
}