function periodicPattern(data){
	var heatmapData;
	//First we extract the max value for the color scale. To use the same scale accross all heatmaps. We also need to extract maximun date so that all normal day heatmaps end at the same date and scales are aligned.
	//We then calculate the weekdata per each element and calculate max values for the scales of weekdata so that all weekheatmaps graphs share the same scale.
	var maxValueLinks = [];
	var maxValueNodes = [];
	var maxWeekDataLinks = [];
	var maxWeekDataNodes = [];
	var maxDate = [];
	data.links.forEach(function(d){
		//Extract Normal heatmap Max per each element
		maxValueLinks.push(d.data.input.max);
		maxValueLinks.push(d.data.output.max);
		d.data.input.values.forEach(function(d){
			maxDate.push(d[0])
		})
		d.data.output.values.forEach(function(d){
			maxDate.push(d[0])
		})
		//Calculate Weekday Data per each element
		d.data.input.weekData = calculateWeekData(d.data.input.values);
		d.data.output.weekData = calculateWeekData(d.data.output.values);
		//Extract Max of each WeekdayData
		maxWeekDataLinks.push(d3.max(d.data.input.weekData.arrayOfValues));
		maxWeekDataLinks.push(d3.max(d.data.output.weekData.arrayOfValues));
	});
	data.nodes.forEach(function(d){
		////Extract Normal heatmap Max per each element
		maxValueNodes.push(d.data.input.max);
		maxValueNodes.push(d.data.output.max);
		d.data.input.values.forEach(function(d){
			maxDate.push(d[0])
		})
		d.data.output.values.forEach(function(d){
			maxDate.push(d[0])
		})
		//Calculate Weekday Data per each element
		d.data.input.weekData = calculateWeekData(d.data.input.values);
		d.data.output.weekData = calculateWeekData(d.data.output.values);
		//Extract Max of each WeekdayData
		maxWeekDataNodes.push(d3.max(d.data.input.weekData.arrayOfValues));
		maxWeekDataNodes.push(d3.max(d.data.output.weekData.arrayOfValues));
	});
	//Calculate Max values
	maxValueLinks = d3.max(maxValueLinks);
	maxValueNodes = d3.max(maxValueNodes);
	maxWeekDataLinks = d3.max(maxWeekDataLinks);
	maxWeekDataNodes = d3.max(maxWeekDataNodes);
	maxDate = d3.max(maxDate);

	//we draw a heatmap per input and output for each of the links and then each of the nodes.
	for(var element in data.links){
		drawElementText("Input: " + data.links[element].node);
		heatmapData = data.links[element].data.input.values;
		heatmap(heatmapData,maxValueLinks,maxDate);
		weekHeatmap(data.links[element].data.input.weekData,maxWeekDataLinks);
		drawElementText("Output: " + data.links[element].node);
		heatmapData = data.links[element].data.output.values;
		heatmap(heatmapData,maxValueLinks,maxDate);
		weekHeatmap(data.links[element].data.output.weekData,maxWeekDataLinks);
	}
	for(var element in data.nodes){
		drawElementText("Input: " + data.nodes[element].node);
		heatmapData = data.nodes[element].data.input.values;
		heatmap(heatmapData,maxValueNodes,maxDate);
		weekHeatmap(data.nodes[element].data.input.weekData,maxWeekDataNodes);
		drawElementText("Output: " + data.nodes[element].node);
		heatmapData = data.nodes[element].data.output.values;
		heatmap(heatmapData,maxValueNodes,maxDate);
		weekHeatmap(data.nodes[element].data.output.weekData,maxWeekDataNodes);
	}
	d3.select('body')
	  .append('div')
	  .attrs({
	  	class:'tooltip'
	  })
	  .style("opacity", 0);
	//Function to calculate weekData each hour from data each day
	function calculateWeekData(data){
		var values = [];
		var arrayOfValues = [];
		var weekDaydata = {Mon:{"00":0,"01":0,"02":0,"03":0,"04":0,"05":0,"06":0,"07":0,"08":0,"09":0,"10":0,"11":0,"12":0,"13":0,"14":0,"14":0,"15":0,"16":0,"17":0,"18":0,"19":0,"20":0,"21":0,"22":0,"23":0},Tue:{"00":0,"01":0,"02":0,"03":0,"04":0,"05":0,"06":0,"07":0,"08":0,"09":0,"10":0,"11":0,"12":0,"13":0,"14":0,"14":0,"15":0,"16":0,"17":0,"18":0,"19":0,"20":0,"21":0,"22":0,"23":0},Wed:{"00":0,"01":0,"02":0,"03":0,"04":0,"05":0,"06":0,"07":0,"08":0,"09":0,"10":0,"11":0,"12":0,"13":0,"14":0,"14":0,"15":0,"16":0,"17":0,"18":0,"19":0,"20":0,"21":0,"22":0,"23":0},Thu:{"00":0,"01":0,"02":0,"03":0,"04":0,"05":0,"06":0,"07":0,"08":0,"09":0,"10":0,"11":0,"12":0,"13":0,"14":0,"14":0,"15":0,"16":0,"17":0,"18":0,"19":0,"20":0,"21":0,"22":0,"23":0},Fri:{"00":0,"01":0,"02":0,"03":0,"04":0,"05":0,"06":0,"07":0,"08":0,"09":0,"10":0,"11":0,"12":0,"13":0,"14":0,"14":0,"15":0,"16":0,"17":0,"18":0,"19":0,"20":0,"21":0,"22":0,"23":0},Sat:{"00":0,"01":0,"02":0,"03":0,"04":0,"05":0,"06":0,"07":0,"08":0,"09":0,"10":0,"11":0,"12":0,"13":0,"14":0,"14":0,"15":0,"16":0,"17":0,"18":0,"19":0,"20":0,"21":0,"22":0,"23":0},Sun:{"00":0,"01":0,"02":0,"03":0,"04":0,"05":0,"06":0,"07":0,"08":0,"09":0,"10":0,"11":0,"12":0,"13":0,"14":0,"14":0,"15":0,"16":0,"17":0,"18":0,"19":0,"20":0,"21":0,"22":0,"23":0}};
		var hoursInDay = ["00","01","02","03","04","05","06","07","08","09","10","11","12","13","14","15","16","17","18","19","20","21","22","23"];
		//Time formats definitions
		getDayOfWeek=d3.timeFormat('%a');
		getHour=d3.timeFormat('%H');
		//Calculate new data for each weekday at each hour
		for(var i=0; i<data.length; i++){
			weekDaydata[getDayOfWeek(data[i][0])][getHour(data[i][0])] +=data[i][1];
		}
		for(var each in weekDaydata){
			for(var element in hoursInDay){
				values.push({"day":each, "hour":hoursInDay[element], "val":weekDaydata[each][hoursInDay[element]]});
				arrayOfValues.push(weekDaydata[each][hoursInDay[element]]);
			}
		}
		//Array of values stores all the values in an array without dates, It is easier to extract max from here.
		return {"values":values,"arrayOfValues":arrayOfValues};
	}
	function handleMouseOver(d,i){
		div = d3.select('.tooltip')
		div.transition()
       	   .duration(500)
           .style("opacity", .9);
        if(d.val !== undefined) div.html("<p id ='mapTooltipname'>" + d.day + " at " + d.hour + ":</p><p>" + d3.format(".2f")(d.val/1024) + " Gb/s</p>" );
        else div.html("<p id ='mapTooltipname'>" + String(d[0]).split(" ")[0] + " " + String(d[0]).split(" ")[1] + " " + String(d[0]).split(" ")[2] + " " + String(d[0]).split(" ")[3] + " at " + String(d[0]).split(" ")[4] + "</p><p>" + d3.format(".2f")(d[1]) + " Mb/s</p>");
        div.style("position","absolute")
           .style("left", (d3.event.pageX + 15) + "px")
           .style("top", (d3.event.pageY ) + "px");
	}
	function handleMouseOut(d,i){
		div = d3.select('.tooltip')
		div.transition()
       	   .duration(500)
           .style("opacity", 0);
	}
	function drawElementText(text){
		d3.select("#AppRegion"+counter)
		.append("p")
		.html(text);
	}

	function createLegend(svgGroup,colorScale,maxData,width){
	    //Create gradients the id assigned has to be the same that appears in the fill parameter of the rectangle
	    createGradient("Gradient",svgGroup,colorScale(0),colorScale(maxData));
	    var legend = svgGroup.append('g')
	                         .attrs({
	                            "class":"heatMapLegend",
	                            "transform": "translate(" + (width) + "," + 15 + ")",
	                         })
	    legend.append("rect")
	            .attrs({
	              "class": "legend",
	              "height": 75,
	              "width": 13,
	              "fill": "url(#Gradient)",
	              "stroke":"rgb(0,0,0)",
	              "stroke-width":0.5
	            });
	    //Add max and minimum value to Legend
	    legend.append("text")
	            .attrs({
	              "transform": "translate(" + (-15) + "," + (-5) + ")"
	            })
	            .styles({
	            	'font-size':"0.75em"
	            })
	            .text(Math.ceil(maxData) + " Mb/s")
	    legend.append("text")
	            .attrs({
	              "transform": "translate(" + (-10) + "," + 90 + ")"
	            })
	            .styles({
	            	'font-size':"0.75em"
	            })
	            .text("0 Mb/s")
	    //Aux function to create an svg vertical Gradient for Legends
		function createGradient(id,svgGroup,startColor,endColor){
		    //Append a defs (for definition) element to your SVG
		    var defs = svgGroup.append("defs");

		    //Append a linearGradient element to the defs and give it a unique id
		    var linearGradient = defs.append("linearGradient")
		        .attr("id", id);
		    //Vertical gradient
		    linearGradient
		        .attrs({
		          "x1": "0%",
		          "y1": "0%",
		          "x2": "0%",
		          "y2": "100%"
		        });
		    //Set the color for the start (0%)
		    linearGradient.append("stop")
		        .attrs({
		          "offset": "0%",
		          "stop-color": endColor //Color bottom
		        })
		    //Set the color for the end (100%)
		    linearGradient.append("stop")
		        .attrs({
		          "offset": "100%",
		          "stop-color": startColor //Color top
		        })
		    return linearGradient;
		}
	}

	function heatmap(data,maxValue,maxDate){
		//Margins and size
		var m = [80, 80, 80, 80];
		var w = 1000 - m[1] - m[3];
		var h = 405 - m[0] - m[2];
		var type;
		//Time formats definitions
		var monthFormat = d3.timeFormat("%B");
		var monthDayFormat = d3.timeFormat('%B-%d');
		var monthDayYearFormat = d3.timeFormat('%B-%d-%Y');
		var monthYearFormat = d3.timeFormat('%B-%Y');
		var monthDayTimeFormat = d3.timeFormat('%B-%d-%H');
		var getDay = d3.timeFormat('%d');
		var getHour = d3.timeFormat('%H');
		var getYear = d3.timeFormat('%Y');
		var getMonthInNumber = d3.timeFormat('%m');
		//Process data
		var dates = [];
		var values = [];
		var hoursInDay = ["00","01","02","03","04","05","06","07","08","09","10","11","12","13","14","15","16","17","18","19","20","21","22","23"];
		//Process data
		var dates = [];
		var values = [];
		data.forEach(function(d) {
		    d[1] = +d[1];
		    dates.push(d[0]);
		    values.push(d[1]);
		  });
		var endDate = maxDate;
		//We get the range of dates and values for scales.
		var dateRange = d3.extent(dates);
		var valueRange = d3.extent(values);
		var heatmapDates = [];
		var ticks;
		var ticksFormat;
		//Check range to make a weekly or monthly or yearly viz depending on the range. We create 3 type of heatmaps weekly, monthly, yearly
		if(d3.timeDay.count(dateRange[0], dateRange[1]) <= 7 ){ //less than a week
			//create small heatmap
			type='week';
			heatmapDates.push(dateRange[0]);
			heatmapDates.push(dateRange[1]);
			ticks = d3.timeDay;
			ticksFormat = monthDayFormat;
		}else if(d3.timeMonth.count(dateRange[0], dateRange[1]) === 0){//less than a month
			//create month heatmap
			type='month';
			var numbOfDays= new Date(getYear(dateRange[0]), getMonthInNumber(dateRange[0]), 0).getDate();
			heatmapDates.push(new Date("1" + monthYearFormat(dateRange[0])));
			heatmapDates.push(new Date ( (dateRange[0].getMonth()+2) + "-1-" + getYear(dateRange[0])));
			ticks=d3.timeDay;
			ticksFormat = monthDayFormat;
		}else if(d3.timeYear.count(dateRange[0], dateRange[1]) === 0){//less than a year
			//create year heatmap
			type='year';
			heatmapDates.push(new Date("1 January" + getYear(dateRange[0])));
			heatmapDates.push(new Date((endDate.getMonth()+2) + "-30-" + getYear(dateRange[1])));
			var lastMonth = endDate.getMonth()+2;
			ticks=d3.timeMonth.every(1);
			ticksFormat = monthFormat;
		}else{//more than a year
			//Todo
		}
		//Scales
		var x = d3.scaleTime().domain([heatmapDates[0], heatmapDates[1]]).range([0, w]);
		var y = d3.scaleBand().domain(hoursInDay).range([h, 0]);
		//Color scale
		var colorScale = d3.scaleLinear().domain([0,maxValue])
	    .interpolate(d3.interpolateHcl)
	    .range([d3.rgb("#E1F5FE"), d3.rgb("#01579B")]);
		var cellHeight = y(getHour(data[0][0])) - y(getHour(data[1][0]));
		var cellWidth = x(addDays(data[0][0],1)) - x(data[0][0]);
		//Create viz
		//Initialize svg
		graph = d3.select("#AppRegion"+counter)
			.append('svg')
			.attrs({
				'class':'heatmap',
				'width': w + m[1] + m[3],
				'height':h + m[0] + m[2]
		});
		//Render Axis
		var xAxis = d3.axisBottom()
				      .scale(x)
				      .ticks(ticks)
		  			  .tickFormat(ticksFormat);
		var yAxis = d3.axisLeft()
				      .scale(y);
		//because the rotation of the axis is weird for positioning the tiks dates I need to do different types of scales
		if(type==='year'){
			graph.append("g")
			      .attrs({
			      	'class': 'xAxis heatmap',
			      	'transform': "translate(" + m[1]+ "," + h + ")"
			      })
			      .call(xAxis)
			      .selectAll("text")
			      .attrs({
			      	'dx': -20,
			      	'dy': 40,
			      	'transform': function(d) { return 'rotate(-65)';},
			      	fill: function(d,i){ //I need to add the first day of the next month so that the last column is not in the air. Here I make that text white so you dont see it.
			      		if(i==31) return 'white';
			      		else return '#000'
			      	}
			      })
		}else if(type==='month'){
			graph.append("g")
			      .attrs({
			      	'class': 'xAxis',
			      	'transform': "translate(" + m[1]+ "," + h + ")"
			      })
			      .call(xAxis)
			      .selectAll("text")
			      .attrs({
			      	'dx': -25,
			      	'dy':15,
			      	'transform': function(d) { return 'rotate(-65)';},
			      	fill: function(d,i){ //I need to add the first day of the next month so that the last column is not in the air. Here I make that text white so you dont see it.
			      		if(i==31) return 'white';
			      		else return '#000'
			      	}
			      })
		}else{
			graph.append("g")
			      .attrs({
			      	'class': 'xAxis',
			      	'transform': "translate(" + m[1]+ "," + h + ")"
			      })
			      .call(xAxis)
			      .selectAll("text")
			      .attrs({
			      	'dx': 30,
			      	'dy':180,
			      	'transform': function(d) { return 'rotate(-65)';}
			      })
		}
	  	graph.append("g")
			  .attrs({
			  	"class": "yAxis",
			  	"transform": "translate(" + m[1] + ",0)"
			  })
			  .call(yAxis)
			  .selectAll("text")
		      .attrs({
		      	'fill': function(d,i){
		      		if(i<8 || i>20) return 'rgb(169, 178, 189)';
		      		else return 'black';
		      	}
		      });
		//Append Squares
		graph.append('g')
			.attrs({
				'transform': "translate(" + m[1] + ",0)"
			})
			.selectAll("rect")
			.data(data)
			.enter()
			.append("rect")
			.attrs({
				'id': function(d,i){ return i;},
				'x': function(d) {
					return x(d3.timeDay.floor(d[0]))},
				'y': function(d) {return y(getHour(d[0]))},
				'height': function(d){return cellHeight},
				'width': function(d){return cellWidth},
				'stroke': function(){ return "black"},
				'stroke-width': function(){return 0},
				'fill': function(d){return colorScale(d[1])}

			})
			.on("mouseover", handleMouseOver)
      		.on("mouseout",handleMouseOut);
      		createLegend(graph, colorScale,maxValue,w+m[0]+20);
		function addDays(date, days) {
	    	var result = new Date(date);
	    	result.setDate(result.getDate() + days);
	    	return result;
		}
	}
	function weekHeatmap(data,maxValue){
		//Margins and size
		var m = [80, 80, 80, 80];
		var w = 600 - m[1] - m[3];
		var h = 405 - m[0] - m[2];
		var hoursInDay = ["00","01","02","03","04","05","06","07","08","09","10","11","12","13","14","15","16","17","18","19","20","21","22","23"];
		var weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
		//We get the range of values for scales.
		var allValues = [];
		var valueRange = d3.extent(data.arrayOfValues);
		var heatmapDates = [];
		var ticks;
		//Scales
		var x = d3.scaleBand().domain(weekDays).range([0, w]);
		var y = d3.scaleBand().domain(hoursInDay).range([h, 0]);
		//Color scale
		var colorScale = d3.scaleLinear().domain([0,maxValue])
	    .interpolate(d3.interpolateHcl)
	    .range([d3.rgb("#E1F5FE"), d3.rgb("#01579B")]);
	    var cellHeight = y(hoursInDay[0])-y(hoursInDay[1]);
		var cellWidth = x(weekDays[1])-x(weekDays[0]);
		//Create viz
		//Initialize svg
		graph = d3.select("#AppRegion"+counter)
			.append('svg')
			.attrs({
				'class':'heatmap',
				'width': w + m[1] + m[3],
				'height':h + m[0] + m[2]
		});
		//Render Axis
		var xAxis = d3.axisBottom()
				      .scale(x);
		var yAxis = d3.axisLeft()
				      .scale(y);
		graph.append("g")
		      .attrs({
		      	'class': 'xAxis',
		      	'transform': "translate(" + m[1]+ "," + h + ")",
		      })
		      .call(xAxis)
		      .selectAll("text")
		      .attrs({
		      	'dx': '0em',
		      	'dy':'1em',
		      })
	  	graph.append("g")
			  .attrs({
			  	"class": "yAxis",
			  	"transform": "translate(" + m[1] + ",0)"
			  })
			  .call(yAxis)
			  .selectAll("text")
		      .attrs({
		      	'fill': function(d,i){
		      		if(i<8 || i>20) return 'rgb(169, 178, 189)';
		      		else return 'black';
		      	}
		      });
		//Append Squares
		graph.append('g')
			.attrs({
				'transform': "translate(" + m[1] + ",0)"
			})
			.selectAll("rect")
			.data(data.values)
			.enter()
			.append("rect")
			.attrs({
				'id': function(d,i){ return i;},
				'x': function(d) {
					return x(d.day)},
				'y': function(d) {
					return y(d.hour)},
				'height': function(d){return cellHeight},
				'width': function(d){return cellWidth},
				'stroke': function(){ return ""},
				'stroke-width': function(){return 0.1},
				'fill': function(d,i){
					return colorScale(d.val)}

			})
			.on("mouseover", handleMouseOver)
      		.on("mouseout",handleMouseOut);
      	createLegend(graph, colorScale,maxValue,w+m[0]+30);
	}
}