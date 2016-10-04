//#################################### HISTOGRAM TABLE GRAPH FUNCTION ###########################
//This funtion wraps all the functions needed to paint the histogram table, creates the bins for the data and the dimension of the graph then it calles table function.
function histogramTableGraph(queryData){
	//Hold the initial link color before selection
	var linkColor;
	var numberBins;
	var columns;
	// Create margins
    var margin = {top: 2, right: 15, bottom: 16, left: 30, nameLeft:30, histogramLeft: 0},
    	width = 350 - margin.left - margin.right,
   		height = 80 - margin.top - margin.bottom;
	//Order the data and launch tables
	sortObjects(queryData.links,".data.input.avg");
	sortObjects(queryData.nodes,".data.input.avg");
	queryData.graphs.table.links = queryData.links;
	queryData.graphs.table.nodes = queryData.nodes;
	columns = ["Links","Incoming Bandwidth (Mb/s)", "Outgoing Bandwidth (Mb/s)","Total Data (GB)"];
    startTable("links-"+counter,queryData.graphs.table.links);
    columns = ["Nodes","Incoming Bandwidth (Mb/s)", "Outgoing Bandwidth (Mb/s)","Total Data (GB)"];
    startTable("nodes-"+counter,queryData.graphs.table.nodes);
	//Convert to dragtable
	$('table').dragtable();
	//Create static header
	staticHeader("#multipleHistogram-links-"+counter);
	staticHeader("#multipleHistogram-nodes-"+counter);

	//#################################### AUX FUNCTIONS ###########################
	//Create a static header for a table
	function staticHeader(tableName){
		table = $(tableName);
		table.after("<table id='header-fixed'></table>")
		var tableOffset = table.offset().top;
		var $header = $("#table-1 > thead").clone();
		var $fixedHeader = $("#header-fixed").append($header);

		$(window).bind("scroll", function() {
		    var offset = $(this).scrollTop();
		    if (offset >= tableOffset && $fixedHeader.is(":hidden")) {
		        $fixedHeader.show();
		    }
		    else if (offset < tableOffset) {
		        $fixedHeader.hide();
		    }
		});
	}
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
			if(this.classList[0].split("-")[0]=="links"){
				linkColor = d3.select("#" + this.classList[0] + this.id)._groups[0][0].style["stroke"]
    			d3.select("#" + this.classList[0] + this.id)
    		 		.style("stroke", "red");
    		}else{
    			var nodeLinks="";
    			 //Change size of node
			    d3.select("#" + this.classList[0] + this.id)
			      .transition()
			      .duration(500)
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
				      nodeLinks = nodeLinks + ("<p>" + eval("queryObjects["+this.classList[0].split("-")[1]+"].links["+d.links[each]+"].node") + "- " + eval("queryObjects["+this.classList[0].split("-")[1]+"].links["+d.links[each]+"].intf") + "</p>")
				    }
				    div.selectAll("*").remove()
				    div.html("<p id ='mapTooltipname'>" + d.node + "</p>"+ nodeLinks )
				       .style("left", (parseInt(d3.select("#" + this.classList[0] + this.id).attr("cx"),10)) + "px")
				       .style("top", (parseInt(d3.select("#" + this.classList[0] + this.id).attr("cy"),10) + d3.select("#" + this.classList[0] + this.id)._groups[0][0].parentElement.parentElement.getBoundingClientRect().top) + "px");
  			}
    	}
    	function handleMouseOutRow(d,i){
    		if(this.classList[0].split("-")[0]=="links"){
				d3.select("#" + this.classList[0] + this.id)
    		  		.style("stroke", linkColor);
    		}else{
    			//return events on lines
			    d3.selectAll(".links")
			      .attr("pointer-events","auto")
			    d3.select("#" + this.classList[0] + this.id)
			      .transition()
			      .duration(500)
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
		numberBins = createBins(data,"rice");
		//numberBins = 5;
	    d3.select("#AppRegion"+counter).append("div")
			.attrs({
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
	        .attrs({
	        	"id": function(d,i){
	        		return i },
	       		"class": tableName + " row"
	        	})
	        .style("background-color", function(d,i){ return ((i % 2 == 0) ? "rgba(63, 191, 127, 0.4)" : "rgba(63, 191, 127, 0.2)");})
	       	.on("mouseover",handleMouseOverRow)
	       	.on("mouseout",handleMouseOutRow);
			var div = d3.select("body").append("div")
			    .attrs({
			    	"id": tableName+"-tableTooltip",
			    	"class": "tableTooltip",
			    	"z-index":10
			    })
			    .style("opacity", 0);
	    dataGroup(tableName,0,data,numberBins,header,rows);
	}
	//###############Function that adds columns headers and corresponding cells (columns per each row) ###############
	function dataGroup(tableName,group,data,numberBins,header,rows){
		var group = group;
		header.selectAll(".head"+group)
			.data(columns)
			.enter()
			.append("th")
			.attrs({
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
	        .attrs({
	        	"class": function(d,i){return tableName + "-" + group + "-col" + i;}, //class: tableName-group-column
	        	"id": function(d,i){ return tableName + "-" + group + this.parentElement.id + "-" + i;} //id: tableName-group-column-cell
	        })
	        .styles({"min-width":"11.3em"}) //I Fix this min-width so that the cells are aligned (node names are smaller than links)
		var selector = d3.selectAll(".col" + group + "-" + 0)
		    .append("input")
		    .attrs({
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
	   	fillTable(tableName,group,data,numberBins,columns);
	}
	//############### Function to fill the formatted data for each column ###############
	function fillTable(tableName,group,data,numberBins){
		var numberBins = numberBins;
		//Create Input and OutputHistogram
	    createHistogram(tableName,group,data,numberBins);
	    //TotalData
	    createTotalData(tableName,group,data);
	}
	//############### Function to draw total data column ###############
	function createTotalData(tableName,group,data){
    	function handleMouseOver(d,i){
    		var split= this.id.split("-")
    		div = d3.select("#" + split[0] + "-" + split[1] + "-tableTooltip");
			div.transition()
   				.duration(200)
   				.style("opacity", .9);
   			if(this.classList[1]=="iData"){
   				div.html("<p>"+ (eval("queryObjects[" + this.classList[0].split("-")[1] + "].graphs.table." + this.classList[0].split("-")[0]+"[" + this.id.split("-")[3] + "].data.totalData[0]")/1024/8).toFixed(0) +" GB</p> <p>"+ (100 * eval("queryObjects[" + this.classList[0].split("-")[1] + "].graphs.table." + this.classList[0].split("-")[0]+"[" + this.id.split("-")[3] + "].data.totalData[0]")/totalDataIn).toFixed(2) + " %" )
		       .style("left", (d3.event.pageX + 5) + "px")
		       .style("top", (d3.event.pageY - 28) + "px");
		   }else{
		   		div.html("<p>"+ (eval("queryObjects[" + this.classList[0].split("-")[1] + "].graphs.table." + this.classList[0].split("-")[0]+"[" + this.id.split("-")[3] + "].data.totalData[1]")/1024/8).toFixed(0) +" GB</p> <p>"+ (100 * eval("queryObjects[" + this.classList[0].split("-")[1] + "].graphs.table." + this.classList[0].split("-")[0]+"[" + this.id.split("-")[3] + "].data.totalData[1]")/totalDataOut).toFixed(2) + " %" )
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
	    	totalDataIn += eval("queryObjects[" + tableName.split("-")[1] + "].graphs.table." + tableName.split("-")[0] + "[each].data.totalData[0]");
	    	totalDataOut += eval("queryObjects[" + tableName.split("-")[1] + "].graphs.table." + tableName.split("-")[0] + "[each].data.totalData[1]");
	    }
	   	var maxX = d3.max([totalDataIn,totalDataOut]);

	    //Set up scales
	    var x = d3.scaleLinear()
	        .domain([0, maxX])
	        .range([0, width])
	        .nice();

	    var xAxis = d3.axisBottom()
	        .scale(x);

	    var svg=d3.selectAll("." + tableName + "-" + group + "-col" + "3").append("svg")
	   		.attrs({
	      		"width": width + margin.left * 1.5 + margin.right,
	      		"height": height + margin.top + margin.bottom,
	    	})
	    var graph = svg.append("g")
	        .attrs({
	        	"class": "graph",
	        	"transform": "translate(" + margin.left * 1.5 + "," + margin.top + ")"
	        });
	    //totalInput
	    var totalInput = graph.append("g")
	        .attr("class", tableName + " totalInput");
	    //Creates totalData input Bar
	    totalInput.append("rect")
	    	.attrs({
	    		"transform": "translate(0," + position.position1 + ")",
			  	"height": barwidth,
			  	"class":"totalDataBar",
			  	"width": function(d){ return x(totalDataIn); }
			})
		//Fills up the totalDatabar input for each individual element
	    totalInput.append("rect")
	    	.attrs({
	    		"class": tableName + " iData",
	    		"id": function(d,i){
	    			return this.classList[0] + "-totalIn-" + i;},
				"transform": "translate(0," + position.position1 + ")",
				"height": barwidth,
				"width": function(d,i){ return x(eval("queryObjects[" + this.classList[0].split("-")[1] + "]." + this.classList[0].split("-")[0]+"[i].data.totalData[0]")); }
			  })
			.on("mouseover",handleMouseOver)
			.on("mouseout",handleMouseOut)
		totalInput.append("text")
	      	.attrs({
	      		"x": -42,
	      		"y": position.position1,
	      		"dy": barwidth/2
	      	})
	      	.text(function(d) { return "Incoming"; });
	    totalInput.append("text")
	      	.attrs({
	      		"x": x(totalDataIn) - margin.right,
	      		"y": position.position1 - barwidth,
	      		"dy": barwidth/2
	      	})
	      	.text(function(d,i) { return (totalDataIn/1024/8).toFixed(0) + " GB"; } );
		//totalOutput
		var totalOutput = graph.append("g")
	        .attr("class", "totalOuput")
	    //Creates totalData input Bar
	    totalOutput.append("rect")
	    	.attrs({
	    		"transform": "translate(0," + position.position2+ ")",
				"height": barwidth,
				"class": "totalDataBar",
				"width": function(d){ return x(totalDataOut);}
			})
		//Fills up the totalDatabar input for each individual element
	    totalOutput.append("rect")
	    	.attrs({
	    	  	"class": tableName + " oData ",
	    	  	"id": function(d,i){ return this.classList[0] + "-totalOut-" + i;},
			  	"transform": "translate(0," + position.position2 + ")",
			  	"height": barwidth,
			  	"width": function(d,i){ return x(eval("queryObjects[" + this.classList[0].split("-")[1] + "]." + this.classList[0].split("-")[0]+"[i].data.totalData[1]")); }
			})
			.on("mouseover",handleMouseOver)
			.on("mouseout",handleMouseOut)
		totalOutput.append("text")
	      	.attrs({
	      		"x": -42,
	      		"y": position.position2,
	      		"dy": barwidth/1.5
	      	})
	      .text(function(d) { return "Outgoing"; });
	    totalOutput.append("text")
	    	.attrs({
	      		"x": x(totalDataOut) - 2.5 * margin.right,
	      		"y": position.position2 - barwidth,
	      		"dy": barwidth/2
	     	})
	     	.text(function(d,i) { return (totalDataOut/1024/8).toFixed(0) + " GB"; });
	}
	//############### Function to create the histogram ###############
	function createHistogram(tableName,group,data,numberBins){
		    ///Histogram distributions
		    var histogramSetUp = d3.histogram().thresholds(numberBins)
		    var inputDataLayouts = [];
		    var outputDataLayouts = [];
		    for (j=0;j<data.length;j++){
		      inputDataLayouts.push(histogramSetUp(data[j].data.input.histogram));
		      outputDataLayouts.push(histogramSetUp(data[j].data.output.histogram));
		    }
		    //Calculate Max values for scales
		    var maxX=[];
		    var maxY=[];
		    for (each in data){
		    	maxX.push(d3.max([d3.max(data[each].data.input.histogram),d3.max(data[each].data.output.histogram)]));
				maxY.push(d3.max([d3.max(inputDataLayouts[each], function(d) { return d.length; }),d3.max(outputDataLayouts[each], function(d) { return d.length; })]));
		    }
		   	var maxX=d3.max(maxX);
		   	var maxY=d3.max(maxY);

		    //Set up scales
		    var x = d3.scaleLinear()
		        .domain([0, maxX])
		        .range([0, width])
		        .nice();

		    var y = d3.scaleLinear()
		        .domain([0, maxY])
		        .range([height, 0]);

		    var xAxis = d3.axisBottom()
		        .scale(x);

		    var yAxis = d3.axisLeft()
		      	.scale(y);
		    //Input
		    fillHistogramColumn(tableName,"." + tableName + "-" + group + "-col1","inputDataLayouts","input",inputDataLayouts,outputDataLayouts,x,y,xAxis,yAxis,data);
		    //Output
		    fillHistogramColumn(tableName,"." + tableName + "-" + group + "-col2","outputDataLayouts","output",outputDataLayouts,outputDataLayouts,x,y,xAxis,yAxis,data);
	}
	//############### function to draw the histogram Column ###############
    function fillHistogramColumn(tableName,colName,colData,legend,inputDataLayouts,outputDataLayouts,x,y,xAxis,yAxis,data){
		function handleMouseOver(d,i){
			var dataInColumn=[];
			div = d3.select("#" + tableName + "-tableTooltip");
			div.transition()
					.duration(200)
					.style("opacity", .9);
		   	div.html("<p>"+ d3.mean(d).toFixed(2) +" Mb/s</p> <p>"+ d.length + " elements" )
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
			var histogramLegend = {width:width - 65,height:16}
	    	var histoLegend = graph.append("g")
						    	.attrs({
						    		class: "histoLegend",
						    		transform:  "translate(" + histogramLegend.width + "," + histogramLegend.height + ")"
						    	})
						    	.append("text");
	    	histoLegend.append("tspan")
	    			   .attrs({
	    			   		x:10,
	    			   		class: tableName + " max",
	    			   		id: function(d,i){ return i;}
	    				})
	    				.text(function(d,i){
	    						return "Max: " + eval("queryObjects[" + this.classList[0].split("-")[1] + "].graphs.table." + this.classList[0].split("-")[0]+"[" + this.id + "].data.input.max.toFixed(2)");
	    				});
	    	histoLegend.append("tspan")
	    			   .attrs({
	    			   		class: tableName + " avg",
	    			   		id: function(d,i){ return i;},
	    			   		x:10,
	    			   		dy: 15
	    				})
	    			   .text(function(d,i){
	    						return "Avg: " + eval("queryObjects[" + this.classList[0].split("-")[1] + "].graphs.table." + this.classList[0].split("-")[0]+"[" + this.id + "].data.input.avg.toFixed(2)");
	    				});
	    	var lineGuides = graph.append("g")
	    	 	.attrs({
	    	 		"class":"lineGuides"
	    	 	});
	    	lineGuides.append("line")
	    	 	.attrs({
	    	 		"class":"maxGuide",
	    	 		"x1":function(d,i){return x(eval("data[i].data."+ type +".max"))},
	    	 		"y1":height,
	    	 		"x2":function(d,i){return x(eval("data[i].data."+ type +".max"))},
	    	 		"y2":0
	    	 	})
	    	 	.styles({
	    	 		"stroke":"red",
	    	 		"stroke-width":1
	    	 	})
	    	lineGuides.append("line")
	    		.attrs({
	    			"class":"minGuide",
	    			"x1":function(d,i){return x(eval("data[i].data."+ type +".avg"))},
	    	 		"y1":height,
	    	 		"x2":function(d,i){return x(eval("data[i].data."+ type +".avg"))},
	    	 		"y2":0,
	    		})
	    		.styles({
	    	 		"stroke":"green",
	    	 		"stroke-width":1
	    	 	})
		}
		var svg=d3.selectAll(colName).append("svg")
	   		.attrs({
	      		"width": width + margin.left + margin.right,
	      		"height": height + margin.top + margin.bottom,
	    	})
	    var graph = svg.append("g")
	        .attrs({
	        	"class": "graph",
	        	"transform": "translate(" + margin.left + "," + margin.top + ")"
	        })
	    var bar = graph.append("g")
	        .attr("class", "histogram")
	        .selectAll(".bar")
	        .data(function(d,i){
	        	return eval((colData) + "[" + i + "]");
	        })
	        .enter().append("g")
	        .attrs({
	        	"class": "bar",
	        	"transform": function(d,i) {
	        		if(isNaN(d.x0)){
						d.x0=0;
						d.x1=0;
					}
					return "translate(" + x(d.x0) + "," + y(d.length) + ")"; }
	        })
	    bar.append("rect")
	        .attrs({
	        	"x": 1,
	        	"width": function(d,i){ return Math.abs((x(d.x1) - x(d.x0))-1)},
		        "height": function(d) { return height - y(d.length); }
	        })
	        .on("mouseover",handleMouseOver)
		  	.on("mouseout",handleMouseOut)

	    graph.append("g")
	      .attrs({
	      	"class": "xAxis",
	      	"transform": "translate(0," + height + ")"
	      })
	      .call(xAxis);
	    createLegend(tableName,legend,data);
	}
	//#################################### END AUX FUNCTIONS ###########################
}