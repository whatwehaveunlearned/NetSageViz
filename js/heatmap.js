function periodicPattern(data){
	var heatmapData;
	for(var element in data.links){
		drawElementText("Input: " + data.links[element].node);
		heatmapData = data.links[element].data.input.values;
		heatmap(heatmapData);
		weekHeatmap(heatmapData);
		drawElementText("Output: " + data.links[element].node);
		heatmapData = data.links[element].data.output.values;
		heatmap(heatmapData);
		weekHeatmap(heatmapData);
	}
	for(var element in data.nodes){
		drawElementText("Input: " + data.nodes[element].node);
		heatmapData = data.nodes[element].data.input.values;
		heatmap(heatmapData);
		weekHeatmap(heatmapData);
		drawElementText("Output: " + data.nodes[element].node);
		heatmapData = data.nodes[element].data.output.values;
		heatmap(heatmapData);
		weekHeatmap(heatmapData);
	}
	d3.select('body')
	  .append('div')
	  .attrs({
	  	class:'tooltip'
	  })
	  .style("opacity", 0);
	function handleMouseOver(d,i){
		div = d3.select('.tooltip')
		div.transition()
       	   .duration(500)
           .style("opacity", .9);
        div.html("<p id ='mapTooltipname'>" + d[0] + "</p>"+ d[1] );
        div.style("position","absolute")
           .style("left", (d3.event.pageX + 15) + "px")
           .style("top", (d3.event.pageY ) + "px");
        console.log("ss");
	}
	function handleMouseOut(d,i){

	}
	function drawElementText(text){
		d3.select("body").append("div")
		.attrs({
			"id": "element"+counter,
			"class": "applicationRegion"
		})
		.append("p")
		.html(text);
	}
	function heatmap(data){
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
		    d[0] = new Date (d[0]*1000);
		    d[1] = +d[1];
		    dates.push(d[0]);
		    values.push(d[1]);
		  });
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
			heatmapDates.push(new Date("31 December" + getYear(dateRange[0])));
			ticks=20;
			ticksFormat = monthFormat;
		}else{//more than a year
			//Todo
		}
		//Scales
		var x = d3.scaleTime().domain([heatmapDates[0], heatmapDates[1]]).range([0, w]);
		var y = d3.scaleBand().domain(hoursInDay).range([h, 0]);
		//Color scale
		var colorLinks = d3.scaleLinear().domain([valueRange[0],valueRange[1]])
	    .interpolate(d3.interpolateHcl)
	    .range([d3.rgb("#E1F5FE"), d3.rgb("#01579B")]);
		var cellHeight = y(getHour(data[0][0])) - y(getHour(data[1][0]));
		var cellWidth = x(addDays(data[0][0],1)) - x(data[0][0]);
		//Create viz
		//Initialize svg
		graph = d3.select('body')
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
			      	'class': 'xAxis',
			      	'transform': "translate(" + m[1]+ "," + h + ")"
			      })
			      .call(xAxis)
			      .selectAll("text")
			      .attrs({
			      	'dx': -20,
			      	'dy': 40,
			      	'transform': function(d) { return 'rotate(-65)';}
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
				'fill': function(d){return colorLinks(d[1])}

			})
			.on("mouseover", handleMouseOver)
      		.on("mouseout",handleMouseOut);;
		function addDays(date, days) {
	    	var result = new Date(date);
	    	result.setDate(result.getDate() + days);
	    	return result;
		}
	}
	function weekHeatmap(data){
		//Margins and size
		var m = [80, 80, 80, 80];
		var w = 600 - m[1] - m[3];
		var h = 405 - m[0] - m[2];
		var hoursInDay = ["00","01","02","03","04","05","06","07","08","09","10","11","12","13","14","15","16","17","18","19","20","21","22","23"];
		var weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
		var weekDaydata = {Mon:{"00":0,"01":0,"02":0,"03":0,"04":0,"05":0,"06":0,"07":0,"08":0,"09":0,"10":0,"11":0,"12":0,"13":0,"14":0,"14":0,"15":0,"16":0,"17":0,"18":0,"19":0,"20":0,"21":0,"22":0,"23":0},Tue:{"00":0,"01":0,"02":0,"03":0,"04":0,"05":0,"06":0,"07":0,"08":0,"09":0,"10":0,"11":0,"12":0,"13":0,"14":0,"14":0,"15":0,"16":0,"17":0,"18":0,"19":0,"20":0,"21":0,"22":0,"23":0},Wed:{"00":0,"01":0,"02":0,"03":0,"04":0,"05":0,"06":0,"07":0,"08":0,"09":0,"10":0,"11":0,"12":0,"13":0,"14":0,"14":0,"15":0,"16":0,"17":0,"18":0,"19":0,"20":0,"21":0,"22":0,"23":0},Thu:{"00":0,"01":0,"02":0,"03":0,"04":0,"05":0,"06":0,"07":0,"08":0,"09":0,"10":0,"11":0,"12":0,"13":0,"14":0,"14":0,"15":0,"16":0,"17":0,"18":0,"19":0,"20":0,"21":0,"22":0,"23":0},Fri:{"00":0,"01":0,"02":0,"03":0,"04":0,"05":0,"06":0,"07":0,"08":0,"09":0,"10":0,"11":0,"12":0,"13":0,"14":0,"14":0,"15":0,"16":0,"17":0,"18":0,"19":0,"20":0,"21":0,"22":0,"23":0},Sat:{"00":0,"01":0,"02":0,"03":0,"04":0,"05":0,"06":0,"07":0,"08":0,"09":0,"10":0,"11":0,"12":0,"13":0,"14":0,"14":0,"15":0,"16":0,"17":0,"18":0,"19":0,"20":0,"21":0,"22":0,"23":0},Sun:{"00":0,"01":0,"02":0,"03":0,"04":0,"05":0,"06":0,"07":0,"08":0,"09":0,"10":0,"11":0,"12":0,"13":0,"14":0,"14":0,"15":0,"16":0,"17":0,"18":0,"19":0,"20":0,"21":0,"22":0,"23":0}};
		var values =[];
		var arrayOfValues = [];
		//Time formats definitions
		dayOfWeekHourFormat = d3.timeFormat('%a-%H');
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
		//We get the range of values for scales.
		var allValues = [];
		var valueRange = d3.extent(arrayOfValues);
		var heatmapDates = [];
		var ticks;
		//Scales
		var x = d3.scaleBand().domain(weekDays).range([0, w]);
		var y = d3.scaleBand().domain(hoursInDay).range([h, 0]);
		//Color scale
		var colorScale = d3.scaleLinear().domain([valueRange[0],valueRange[1]])
	    .interpolate(d3.interpolateHcl)
	    .range([d3.rgb("#E1F5FE"), d3.rgb("#01579B")]);
	    var cellHeight = y(hoursInDay[0])-y(hoursInDay[1]);
		var cellWidth = x(weekDays[1])-x(weekDays[0]);
		//Create viz
		//Initialize svg
		graph = d3.select('body')
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
			.data(values)
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

			});
	}
}