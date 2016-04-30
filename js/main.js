//Global Variables
var windowWith = $(window).width();
var windowHeight = $(window).height();
var links;
var queryObjects = [];
var initialQuery =  "What was the min, max, average bandwith used between the IRNC links ";
var counter=-1;
function main (){
	queryForm(initialQuery);
}
//Query Object Prototype
function Query(query,date){
	this.queryText = query;
	this.date = date;
	this.links = 0;
	this.nodes = 0;
	this.graphs = ({
		"table" : ({
						"links":null,
						"nodes":null
					}),
		"map" : null
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
	var queryTypes = ["What was the min, max, average bandwith used between the IRNC links ","todo1 ", "todo2 "]
	var timeFrames = ["Now","Today","Last 7 days","This Month","This Year","Time Frame"]
	var logoWidth = 100;
	var logoHeight = 100;
	var querySelector = d3.select("body").append("div")
		.attr({
			class:"querySelector"
		});
	querySelector.append("img")
		.attr({
			"src":"logo.png",
			"width":logoWidth,
			"height":logoHeight
		});
	queryForm=querySelector.append("form")
		.attr({
			"id":"queryForm"
		});
	fieldset = queryForm.append("fieldset")
						.attr({
							"id":"fieldset"
						});

	fieldset.append("label")
			.attr({
			 	"for":"query"
			 })
			.html("Select a query:");
	var queryTypeSelect = fieldset.append("select")
					.attr({
						"name": "query",
						"id":"query"
					});
	for (var i in queryTypes){
		queryTypeSelect.append("option")
			.html(queryTypes[i]);
	}
	var queryTimeFrame = fieldset.append("select")
					.attr({
						"name": "timeFrame",
						"id":"timeFrame"
					});
	for (var i in timeFrames){
		queryTimeFrame.append("option")
			.html(timeFrames[i]);
	}
	//We prefill with the pickers with the now data
	var today = new Date();
	var threeHoursBefore = new Date(today.getTime() - (3 * 60 * 60 * 1000));
	createDatePickers(true,true,threeHoursBefore,today,true);
	$("#query").selectmenu();
	$("#timeFrame").selectmenu({
      change: function( event, data ) {
		var today = new Date();
		$( "#datePickerStart" ).remove();
			$( "#datePickerEnd" ).remove();
      	//If we select Between create 2 datePickers
        if(data.item.label===timeFrames[5]){
        	createDatePickers(true,true,"","",false);
		//For the specified ranges we fill up the date pickers
        }else if(data.item.label===timeFrames[4]){
        	var januaryFirst = new Date(new Date().getFullYear(), 0, 1);
        	createDatePickers(true,true,januaryFirst,today,false);
         }else if(data.item.label===timeFrames[3]){
			var monthFirst = new Date(today.getFullYear(), today.getMonth(), 1);
			createDatePickers(true,true,monthFirst,today,false);
		 }else if(data.item.label===timeFrames[2]){
        	var sevenDaysBefore = new Date(today.getTime() - (7 * 24 * 60 * 60 * 1000));
			createDatePickers(true,true,sevenDaysBefore,today,false);
		}else if(data.item.label===timeFrames[1]){
			createDatePickers(true,true,today,today,false);
		}else if(data.item.label===timeFrames[0]){
			var threeHoursBefore = new Date(today.getTime() - (3 * 60 * 60 * 1000));
			createDatePickers(true,true,threeHoursBefore,today,true);
    	}
      }
     });

	querySelector.append("button")
	.attr({
		"type":"submit",
		"id":"submit"
	}).html("Ask NetSage")
	.on("click",handleOnClick);
	function handleOnClick(){
		//Increase counter
		counter=counter+1;
		//Read query
		var queryType = $("#query")[0].value
		//Read TimeFrame
		var timeFrame = $("#timeFrame")[0].value
		//Read Dates
		var queryDate;
		var dayFormat = d3.time.format("%m/%d/%Y");
		var timeFormat = d3.time.format("%H:%M:%S");
		var today = new Date();
		var avgOver = 60;
		var todayFormated = dayFormat(today);
		var timeFormated = timeFormat(today);
		if (timeFrame === "Time Frame") {
			avgOver = 120;
			queryDate = [d3.select("#datePickerStart")[0][0].value + " " + d3.select("#timeStart")[0][0].value + " UTC" ,d3.select("#datePickerEnd")[0][0].value + " " + d3.select("#timeStop")[0][0].value + " UTC"];
		} else if (timeFrame === "On a specific day") {
			queryDate = [d3.select("#datePickerStart")[0][0].value + d3.select("#timeStart")[0][0].value + " UTC"];
		} else if (timeFrame === "This Year"){
			avgOver = 21600;
			queryDate = [d3.select("#datePickerStart")[0][0].value + " " + d3.select("#timeStart")[0][0].value + " UTC" ,d3.select("#datePickerEnd")[0][0].value + " " + d3.select("#timeStop")[0][0].value + " UTC"];
			//queryDate = [ januaryFirst + " 00:00:00 UTC" ,todayFormated + " " + timeFormated + " UTC"];
		} else if (timeFrame === "This Month"){
			avgOver = 720;
			queryDate = [d3.select("#datePickerStart")[0][0].value + " " + d3.select("#timeStart")[0][0].value + " UTC" ,d3.select("#datePickerEnd")[0][0].value + " " + d3.select("#timeStop")[0][0].value + " UTC"];
		} else if (timeFrame === "Last 7 days"){
			avgOver = 120;
			queryDate = [d3.select("#datePickerStart")[0][0].value + " " + d3.select("#timeStart")[0][0].value + " UTC" ,d3.select("#datePickerEnd")[0][0].value + " " + d3.select("#timeStop")[0][0].value + " UTC"];
		}
		else if (timeFrame === "Today"){
			queryDate = [d3.select("#datePickerStart")[0][0].value + " " + d3.select("#timeStart")[0][0].value + " UTC" ,d3.select("#datePickerEnd")[0][0].value + " " + d3.select("#timeStop")[0][0].value + " UTC"];
		} else if (timeFrame === "Now"){
			avgOver = 60;
			var threeHoursBefore = new Date(today.getTime() - (3*60 * 60 * 1000));
			queryDate = [d3.select("#datePickerStart")[0][0].value + " " + d3.select("#timeStart")[0][0].value + " UTC" ,d3.select("#datePickerEnd")[0][0].value + " " + d3.select("#timeStop")[0][0].value + " UTC"];
		}
		queryObjects.push(new Query(queryType + " " + timeFrame + ": " + queryDate[0] + " , " + queryDate[1],queryDate))
		LoadData(queryObjects[counter].date,queryObjects[counter].queryText,avgOver);
	}
	//Function to fill up and create the necesarry datePickers depending on the selected TimeFrame
	function createDatePickers(start,stop,startDate,stopDate,isNow){
		var dayFormat = d3.time.format("%m/%d/%Y");
		var timeFormat = d3.time.format("%H:%M:%S");
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
			.attr({
				"type":"text",
				"id": "datePickerStart"
			});
			var timeSelect = d3.select("#fieldset").append("select")
								.attr({
									"id":"timeStart"
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
				.attr({
					"type":"text",
					"id": "datePickerEnd"
				});
				var timeSelect = d3.select("#fieldset").append("select")
								.attr({
									"id":"timeStop"
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
}