//Global Variables
var windowWith = $(window).width();
var windowHeight = $(window).height();
var links;
var results;
var queryObjects = [];
var counter=-1;
function main (){
	queryForm();
}
//Get Parameters from url
function getUrlParameter(sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1];
        }
    }
}

//Query Object Prototype
function Query(query,date,avgOver,queryType){
	this.queryText = query;
	this.date = date;
	this.links = 0;
	this.nodes = 0;
	this.avgOver = avgOver;
	this.queryType = queryType;
	this.graphs = ({
		"table" : 	({
						"links":null,
						"nodes":null
					}),
		"map" 	: 	({
						"links":null,
						"nodes":null
					}),
	});
	this.printQuery = function (){
		return queryText;
	};
	this.getNodes = function(){
		return this.nodes;
	};
	this.getLinks = function(){
		return this.links;
	}
	return this;
}
function queryForm(){
	//Populate queryForm Values
	var queryTypes = ["What was the min, max, average ","What is the duration and are there any periodic patterns or peak periods ", "todo2 "];
	var queryMeasures = ["In Bandwith use"," In Losses"];
	var queryValues = ["Accross the IRNC Network","Accross the IRNC Links","Accross the IRNC Nodes"];
	if(getUrlParameter("date")!=undefined) var timeFrames = ["Time Frame","Now","Today","Last 7 days","This Month","This Year"];
	else var timeFrames = ["Now","Today","Last 7 days","This Month","This Year","Time Frame"];
	var logoWidth = 100;
	var logoHeight = 100;
	var querySelector = d3.select("body").append("div")
		.attrs({
			class:"querySelector"
		});
	querySelector.append("img")
		.attrs({
			"src":"logo.png",
			"width":logoWidth,
			"height":logoHeight
		})
		.on("click",function(){ window.location.href="http://www.netsage.global/"});
	queryForm=querySelector.append("form")
		.attrs({
			"id":"queryForm"
		});
	fieldset = queryForm.append("fieldset")
						.attrs({
							"id":"fieldset"
						});
	//Create Query Type Select
	var queryTypeSelect = fieldset.append("div")
								  .attrs({
								  	"id":"queryTypeDiv"
								  })
								  .append("select")
								  .attrs({
									 "name": "queryType",
						             "id":"queryType"
								  })
	for (var i in queryTypes){
		queryTypeSelect.append("option")
			.attrs({"value":i})
			.html(queryTypes[i]);
	}
	//Create Query Measure Select
	var queryMeasureSelect = fieldset.append("div")
								  .attrs({
								  	"id":"queryMeasureDiv"
								  })
								  .append("select")
								  .attrs({
									"name": "queryMeasure",
									"id":"queryMeasure"
								  });
	for (var i in queryMeasures){
		queryMeasureSelect.append("option")
			.attrs({"value":i})
			.html(queryMeasures[i]);
	}
	//Create Query Values Select
	var queryValueSelect = fieldset.append("div")
								  .attrs({
								  	"id":"queryValueDiv"
								  })
								  .append("select")
								  .attrs({
								     "name": "queryValue",
									 "id":"queryValue"
								  });
	for (var i in queryValues){
		queryValueSelect.append("option")
			.attrs({"value":i})
			.html(queryValues[i]);
	}
	//Create queryTimeFrames Select
	var queryTimeFrame = fieldset.append("div")
								  .attrs({
								  	"id":"queryTimeFrameDiv"
								  })
								  .append("select")
								  .attrs({
									"name": "queryTimeFrame",
									"id":"queryTimeFrame"
								  });
	for (var i in timeFrames){
		queryTimeFrame.append("option")
			.html(timeFrames[i]);
	}
	//If the URL has parameters load the search with those and execute the search
	if(getUrlParameter("date")!=undefined){
		var day = getUrlParameter("date").split(",");
		createDatePickers(new Date(day[0]),new Date(day[1]),true);
		handleOnClick(day,true);

	}else{//If there are no parameters passed. We prefill with the pickers with the now data
		var day = new Date();
		var threeHoursBefore = new Date(day.getTime() - (3 * 60 * 60 * 1000));
		createDatePickers(threeHoursBefore,day,true);
	}
	//Convert to Jquery select menus
	$("#queryType").selectmenu({ width : 'auto'});
	$("#queryMeasure").selectmenu({ width : 'auto'});
	$("#queryValue").selectmenu({ width : 'auto'});
	$("#queryTimeFrame").selectmenu({
      change: function( event, data ) {
		var day = new Date();
		$( "#datePickerStart" ).remove();
		$( "#datePickerEnd" ).remove();
      	//If we select Time Frame create 2 empty datePickers
        if(data.item.label==="Time Frame"){
        	createDatePickers("","",false);
		//For the specified ranges we fill up the date pickers
        }else if(data.item.label==="This Year"){
        	var januaryFirst = new Date(new Date().getFullYear(), 0, 1);
        	createDatePickers(januaryFirst,day,false);
         }else if(data.item.label==="This Month"){
			var monthFirst = new Date(day.getFullYear(), day.getMonth(), 1);
			createDatePickers(monthFirst,day,false);
		 }else if(data.item.label==="Last 7 days"){
        	var sevenDaysBefore = new Date(day.getTime() - (7 * 24 * 60 * 60 * 1000));
			createDatePickers(sevenDaysBefore,day,false);
		}else if(data.item.label==="Today"){
			createDatePickers(day,day,false);
		}else if(data.item.label==="Now"){
			var threeHoursBefore = new Date(day.getTime() - (3 * 60 * 60 * 1000));
			createDatePickers(threeHoursBefore,day,true);
    	}
      },
      width:'auto'
     });

	queryForm.append("button")
	.attrs({
		"type":"button",
		"id":"submit"
	}).html("Ask NetSage")
	.on("click",handleOnClick);
	//Function that reads the query
	function handleOnClick(urlDate,fromURL){
		var dayFormat = d3.timeFormat("%m/%d/%Y");
		var timeFormat = d3.timeFormat("%H:%M:%S");
		//Increase counter
		counter=counter+1;
		//Read query type
		if(getUrlParameter("queryType")!=undefined && fromURL===true) var queryType = getUrlParameter("queryType");
		else var queryType = $("#queryType")[0].value;
		//Read query Name
		if(getUrlParameter("queryName")!=undefined && fromURL===true) var queryName = getUrlParameter("queryName");
		else var queryName = $("#query option:selected").html();
		//Read TimeFrame
		var timeFrame = $("#queryTimeFrame")[0].value
		//Read Dates
		var queryDate;
		if(getUrlParameter("avgOver")!=undefined && fromURL===true) var avgOver = parseInt(getUrlParameter("avgOver"),10);
		else var avgOver = 60;
		//UTC date
		var UTCDateStart;
		var UTCDateStop;
		UTCDateStart = new Date(d3.select("#datePickerStart")._groups[0][0].value + " " + d3.select("#timeStart")._groups[0][0].value )
		UTCDateStart = new Date(UTCDateStart.getUTCFullYear(), UTCDateStart.getUTCMonth(), UTCDateStart.getUTCDate(),  UTCDateStart.getUTCHours(), UTCDateStart.getUTCMinutes(), UTCDateStart.getUTCSeconds());
		UTCDateStop = new Date(d3.select("#datePickerEnd")._groups[0][0].value + " " + d3.select("#timeStop")._groups[0][0].value )
		UTCDateStop = new Date(UTCDateStop.getUTCFullYear(), UTCDateStop.getUTCMonth(), UTCDateStop.getUTCDate(),  UTCDateStop.getUTCHours(), UTCDateStop.getUTCMinutes(), UTCDateStop.getUTCSeconds());
		console.log(UTCDateStart);
		console.log(UTCDateStop);
		if (timeFrame === "Time Frame") {
			if(queryType==="1") avgOver = 3600; //get avg per each hour. This is the data format the heatmaps are expecting.
			queryDate = [dayFormat(UTCDateStart) + " " + timeFormat(UTCDateStart) + " UTC" ,dayFormat(UTCDateStop) + " " + timeFormat(UTCDateStop) + " UTC"];
		}else if (timeFrame === "This Year"){
			avgOver = 3600;
			if(queryType==="1") avgOver = 3600;
			queryDate = [dayFormat(UTCDateStart) + " " + timeFormat(UTCDateStart) + " UTC" ,dayFormat(UTCDateStop) + " " + timeFormat(UTCDateStop) + " UTC"];
		} else if (timeFrame === "This Month"){
			avgOver = 600;
			if(queryType==="1") avgOver = 3600;
			queryDate = [dayFormat(UTCDateStart) + " " + timeFormat(UTCDateStart) + " UTC" ,dayFormat(UTCDateStop) + " " + timeFormat(UTCDateStop) + " UTC"];
		} else if (timeFrame === "Last 7 days"){
			avgOver = 120;
			if(queryType==="1") avgOver = 3600;
			queryDate = [dayFormat(UTCDateStart) + " " + timeFormat(UTCDateStart) + " UTC" ,dayFormat(UTCDateStop) + " " + timeFormat(UTCDateStop) + " UTC"];
		}
		else if (timeFrame === "Today"){
			avgOver =1;
			if(queryType==="1") avgOver = 3600;
			queryDate = [dayFormat(UTCDateStart) + " " + timeFormat(UTCDateStart) + " UTC" ,dayFormat(UTCDateStop) + " " + timeFormat(UTCDateStop) + " UTC"];
		} else if (timeFrame === "Now"){
			avgOver =1;
			if(queryType==="1") avgOver = 3600;
			queryDate = [dayFormat(UTCDateStart) + " " + timeFormat(UTCDateStart) + " UTC" ,dayFormat(UTCDateStop) + " " + timeFormat(UTCDateStop) + " UTC"];
		}
		queryObjects.push(new Query(queryName + " " + timeFrame + ": " + queryDate[0] + " , " + queryDate[1],queryDate,avgOver,queryType))
		//when we make a second query in the same page we open a new tab.
		if($("#query0")[0]!==undefined){
			url = getQuery(queryDate,avgOver,queryType,queryName);
			myWindow = window.open(url,'_blank');
			myWindow.focus();
		}else{
			LoadData(queryObjects[counter].date,queryObjects[counter].queryText,queryObjects[counter].avgOver,queryObjects[counter].queryType);
		}
	}
	//Function to fill up and create the necesarry datePickers depending on the selected TimeFrame
	function createDatePickers(startDate,stopDate,isNow){
		var dayFormat = d3.timeFormat("%m/%d/%Y");
		var timeFormat = d3.timeFormat("%H:%M");
		$('#dateHourDiv').remove();
		var queryTimeFrameDiv = d3.select("#queryTimeFrameDiv");
		if (isNow==true) var hoursSelectionStart = [timeFormat(startDate),"00:00","01:00","02:00","03:00","04:00","05:00","06:00","07:00","08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00","19:00","20:00","21:00","22:00","23:00"];
		else var hoursSelectionStart = ["00:00","01:00","02:00","03:00","04:00","05:00","06:00","07:00","08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00","19:00","20:00","21:00","22:00","23:00"];
		if (startDate != "") var StartDateFormated = dayFormat(startDate);
		else var StartDateFormated = "";
		var dateHourDiv = queryTimeFrameDiv.append("div")
						 .attrs({
						 	"id":"dateHourDiv"
						 })
		dateHourDiv.append("span")
						 .html("From: ")
		dateHourDiv.append("input")
			.attrs({
				"type":"text",
				"id": "datePickerStart",
				"class": "datePicker"
			});
		dateHourDiv.append("span")
						 .html(" at: ")
		var timeSelect = dateHourDiv.append("select")
							.attrs({
								"id":"timeStart",
								"class":"timePicker"
							});
		for (var each in hoursSelectionStart){
			timeSelect.append("option")
				.html(hoursSelectionStart[each]);
		}
		if (stopDate != ""){
			var StopDateFormated = dayFormat(stopDate);
			var timeFormated = timeFormat(stopDate);
			var hoursSelectionStop = [timeFormat(stopDate),"00:00","01:00","02:00","03:00","04:00","05:00","06:00","07:00","08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00","19:00","20:00","21:00","22:00","23:00"];
		}
		else{
			var StopDateFormated = "";
			var hoursSelectionStop = ["00:00","01:00","02:00","03:00","04:00","05:00","06:00","07:00","08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00","19:00","20:00","21:00","22:00","23:00"];
		}
		dateHourDiv.append("span")
						 .html(" to: ")
		dateHourDiv.append("input")
			.attrs({
				"type":"text",
				"id": "datePickerEnd",
				"class": "datePicker"
			});
		dateHourDiv.append("span")
					 .html(" at: ")
		var timeSelect = dateHourDiv.append("select")
						.attrs({
							"id":"timeStop",
							"class":"timePicker"
						});
		for (var each in hoursSelectionStop){
			timeSelect.append("option")
				.html(hoursSelectionStop[each]);
		}
		//Options for datePickers
		$( "#datePickerStart" ).datepicker({
			firstDay:1,
		});
		$( "#datePickerEnd" ).datepicker({
			firstDay:1
		});
		//Set the days of the datePickers for timeFrames
		$( "#datePickerStart" ).datepicker("setDate",StartDateFormated);
		$( "#datePickerEnd" ).datepicker("setDate",StopDateFormated);
	}
	//Function to create URL to add to a new tab with the query.
	function getQuery(queryDate,avgOver,queryType,queryName){
		var urlParam = [];
		urlParam.push(encodeURI("date") + "=" + encodeURI(queryDate));
		urlParam.push(encodeURI("avgOver") + "=" + encodeURI(avgOver));
		urlParam.push(encodeURI("queryType") + "=" + encodeURI(queryType));
		urlParam.push(encodeURI("queryName") + "=" + encodeURI(queryName));
		return "main.html?" + urlParam.join("&");
	}
}