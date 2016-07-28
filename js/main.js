//Global Variables
var windowWith = $(window).width();
var windowHeight = $(window).height();
var links;
var results;
var queryObjects = [];
var initialQuery =  "What was the min, max, average bandwith used between the IRNC links ";
var counter=-1;
function main (){
	queryForm(initialQuery);
	d3.select("#timeFrame-button")
	  .style({
  			"width": "8.3em"
	  });
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
function Query(query,date,avgOver){
	this.queryText = query;
	this.date = date;
	this.links = 0;
	this.nodes = 0;
	this.avgOver = avgOver;
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
function queryForm(query){
	var queryTypes = ["What was the min, max, average bandwith used between the IRNC links ","todo1 ", "todo2 "];
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
		});
	queryForm=querySelector.append("form")
		.attrs({
			"id":"queryForm"
		});
	fieldset = queryForm.append("fieldset")
						.attrs({
							"id":"fieldset"
						});

	var queryTypeSelect = fieldset.append("select")
					.attrs({
						"name": "query",
						"id":"query"
					});
	for (var i in queryTypes){
		queryTypeSelect.append("option")
			.html(queryTypes[i]);
	}
	var queryTimeFrame = fieldset.append("select")
					.attrs({
						"name": "timeFrame",
						"id":"timeFrame"
					});
	for (var i in timeFrames){
		queryTimeFrame.append("option")
			.html(timeFrames[i]);
	}
	//If the URL has parameters load the search with those and execute the search
	if(getUrlParameter("date")!=undefined){
		var day = eval(getUrlParameter("date"));
		createDatePickers(true,true,new Date(day[0]),new Date(day[1]),true);
		handleOnClick(day);

	}else{//If there are no parameters passed. We prefill with the pickers with the now data
		var day = new Date();
		var threeHoursBefore = new Date(day.getTime() - (3 * 60 * 60 * 1000));
		createDatePickers(true,true,threeHoursBefore,day,true);
	}
	$("#query").selectmenu();
	$("#timeFrame").selectmenu({
      change: function( event, data ) {
		var day = new Date();
		$( "#datePickerStart" ).remove();
			$( "#datePickerEnd" ).remove();
      	//If we select Between create 2 empty datePickers
        if(data.item.label==="Time Frame"){
        	createDatePickers(true,true,"","",false);
		//For the specified ranges we fill up the date pickers
        }else if(data.item.label==="This Year"){
        	var januaryFirst = new Date(new Date().getFullYear(), 0, 1);
        	createDatePickers(true,true,januaryFirst,day,false);
         }else if(data.item.label==="This Month"){
			var monthFirst = new Date(day.getFullYear(), day.getMonth(), 1);
			createDatePickers(true,true,monthFirst,day,false);
		 }else if(data.item.label==="Last 7 days"){
        	var sevenDaysBefore = new Date(day.getTime() - (7 * 24 * 60 * 60 * 1000));
			createDatePickers(true,true,sevenDaysBefore,day,false);
		}else if(data.item.label==="Today"){
			createDatePickers(true,true,day,day,false);
		}else if(data.item.label==="Now"){
			var threeHoursBefore = new Date(day.getTime() - (3 * 60 * 60 * 1000));
			createDatePickers(true,true,threeHoursBefore,day,true);
    	}
      }
     });

	querySelector.append("button")
	.attrs({
		"type":"submit",
		"id":"submit"
	}).html("Ask NetSage")
	.on("click",handleOnClick);
	function handleOnClick(urlDate){
		var dayFormat = d3.timeFormat("%m/%d/%Y");
		var timeFormat = d3.timeFormat("%H:%M:%S");
		//Increase counter
		counter=counter+1;
		//Read query
		var queryType = $("#query")[0].value
		//Read TimeFrame
		var timeFrame = $("#timeFrame")[0].value
		//Read Dates
		var queryDate;
		if(getUrlParameter("avgOver")!=undefined) var avgOver = parseInt(getUrlParameter("avgOver"));
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
			//avgOver = 60;
			avgOver = 3600;//sample each day to get avg each day. This is the avgOver value I need for the pattern recognition.
			queryDate = [dayFormat(UTCDateStart) + " " + timeFormat(UTCDateStart) + " UTC" ,dayFormat(UTCDateStop) + " " + timeFormat(UTCDateStop) + " UTC"];
		}else if (timeFrame === "This Year"){
			//avgOver = 21600;
			avgOver = 3600;//sample each day to get avg each day. This is the avgOver value I need for the pattern recognition.
			queryDate = [dayFormat(UTCDateStart) + " " + timeFormat(UTCDateStart) + " UTC" ,dayFormat(UTCDateStop) + " " + timeFormat(UTCDateStop) + " UTC"];
		} else if (timeFrame === "This Month"){
			//avgOver = 720;
			avgOver = 3600;//sample each day to get avg each day. This is the avgOver value I need for the pattern recognition.
			queryDate = [dayFormat(UTCDateStart) + " " + timeFormat(UTCDateStart) + " UTC" ,dayFormat(UTCDateStop) + " " + timeFormat(UTCDateStop) + " UTC"];
		} else if (timeFrame === "Last 7 days"){
			avgOver = 120;
			queryDate = [dayFormat(UTCDateStart) + " " + timeFormat(UTCDateStart) + " UTC" ,dayFormat(UTCDateStop) + " " + timeFormat(UTCDateStop) + " UTC"];
		}
		else if (timeFrame === "Today"){
			queryDate = [dayFormat(UTCDateStart) + " " + timeFormat(UTCDateStart) + " UTC" ,dayFormat(UTCDateStop) + " " + timeFormat(UTCDateStop) + " UTC"];
		} else if (timeFrame === "Now"){
			avgOver = 60;
			queryDate = [dayFormat(UTCDateStart) + " " + timeFormat(UTCDateStart) + " UTC" ,dayFormat(UTCDateStop) + " " + timeFormat(UTCDateStop) + " UTC"];
		}
		queryObjects.push(new Query(queryType + " " + timeFrame + ": " + queryDate[0] + " , " + queryDate[1],queryDate,avgOver))
		if($("#query0")[0]!==undefined){
			url = getQuery(avgOver);
			myWindow = window.open(url,'_blank');
			myWindow.focus();
		}else{
			LoadData(queryObjects[counter].date,queryObjects[counter].queryText,queryObjects[counter].avgOver);
		}
	}
	//Function to fill up and create the necesarry datePickers depending on the selected TimeFrame
	function createDatePickers(start,stop,startDate,stopDate,isNow){
		var dayFormat = d3.timeFormat("%m/%d/%Y");
		var timeFormat = d3.timeFormat("%H:%M:%S");
		$( "#datePickerStart" ).remove();
		$( "#datePickerEnd" ).remove();
		$( "#timeStart" ).remove();
		$( "#timeStop" ).remove();
		if(start==true){
			if (isNow==true) var hoursSelectionStart = [timeFormat(startDate),"00:00:00","01:00:00","02:00:00","03:00:00","04:00:00","05:00:00","06:00:00","07:00:00","08:00:00","09:00:00","10:00:00","11:00:00","12:00:00","13:00:00","14:00:00","15:00:00","16:00:00","17:00:00","18:00:00","19:00:00","20:00:00","21:00:00","22:00:00","23:00:00"];
			else var hoursSelectionStart = ["00:00:00","01:00:00","02:00:00","03:00:00","04:00:00","05:00:00","06:00:00","07:00:00","08:00:00","09:00:00","10:00:00","11:00:00","12:00:00","13:00:00","14:00:00","15:00:00","16:00:00","17:00:00","18:00:00","19:00:00","20:00:00","21:00:00","22:00:00","23:00:00"];
			if (startDate != "") var StartDateFormated = dayFormat(startDate);
			else var StartDateFormated = "";
			fieldset.append("input")
			.attrs({
				"type":"text",
				"id": "datePickerStart",
				"class": "datePicker"
			});
			var timeSelect = d3.select("#fieldset").append("select")
								.attrs({
									"id":"timeStart",
									"class":"timePicker"
								});
			for (var each in hoursSelectionStart){
				timeSelect.append("option")
					.html(hoursSelectionStart[each]);
			}
		}
		if(stop==true){
			if (startDate != ""){
				var StopDateFormated = dayFormat(stopDate);
				var timeFormated = timeFormat(stopDate);
				var hoursSelectionStop = [timeFormat(stopDate),"00:00:00","01:00:00","02:00:00","03:00:00","04:00:00","05:00:00","06:00:00","07:00:00","08:00:00","09:00:00","10:00:00","11:00:00","12:00:00","13:00:00","14:00:00","15:00:00","16:00:00","17:00:00","18:00:00","19:00:00","20:00:00","21:00:00","22:00:00","23:00:00"];
			}
			else{
				var StopDateFormated = "";
				var hoursSelectionStop = ["00:00:00","01:00:00","02:00:00","03:00:00","04:00:00","05:00:00","06:00:00","07:00:00","08:00:00","09:00:00","10:00:00","11:00:00","12:00:00","13:00:00","14:00:00","15:00:00","16:00:00","17:00:00","18:00:00","19:00:00","20:00:00","21:00:00","22:00:00","23:00:00"];
			}
			fieldset.append("input")
				.attrs({
					"type":"text",
					"id": "datePickerEnd",
					"class": "datePicker"
				});
				var timeSelect = d3.select("#fieldset").append("select")
								.attrs({
									"id":"timeStop",
									"class":"timePicker"
								});
			for (var each in hoursSelectionStop){
				timeSelect.append("option")
					.html(hoursSelectionStop[each]);
			}
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
	function getQuery(avgOver){
		var urlParam = [];
		var date = JSON.stringify(queryObjects[0].date);
		urlParam.push(encodeURI("date") + "=" + encodeURI(date));
		urlParam.push(encodeURI("avgOver") + "=" + encodeURI(avgOver));
		return "main.html?" + urlParam.join("&");
	}
}