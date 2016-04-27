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
function Query(query,date){
	this.queryText = query;
	this.date = date;
	this.links = 0;
	this.nodes = 0;
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
	var timeFrames = ["This Year","This Month","Last 7 days","Today","Now","On a specific day","Between"]
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
	fieldset = queryForm.append("fieldset");

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
	$("#query").selectmenu();
	$("#timeFrame").selectmenu({
      change: function( event, data ) {
      	//If we select Between create 2 datePickers
        if(data.item.label==="Between"){
        	$( "#datePickerStart" ).remove();
			$( "#datePickerEnd" ).remove();
        	fieldset.append("input")
				.attr({
					"type":"text",
					"id": "datePickerStart"
				});
			fieldset.append("input")
				.attr({
					"type":"text",
					"id": "datePickerEnd"
				});
			$( "#datePickerStart" ).datepicker();
			$( "#datePickerEnd" ).datepicker();
		//If we select On a sepeific Day we create 1 datePicker
        }else if(data.item.label==="On a specific day"){
        	$( "#datePickerStart" ).remove();
			$( "#datePickerEnd" ).remove();
        	fieldset.append("input")
				.attr({
					"type":"text",
					"id": "datePickerStart"
				});
				$( "#datePickerStart" ).datepicker();
        }else{
        	$( "#datePickerStart" ).remove();
			$( "#datePickerEnd" ).remove();
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
		if (timeFrame === "Between") {
			queryDate = [d3.select("#datePickerStart")[0][0].value + " 00:00:00 UTC" ,d3.select("#datePickerEnd")[0][0].value + " 00:00:00 UTC"];
		} else if (timeFrame === "On a specific day") {
			queryDate = [d3.select("#datePickerStart")[0][0].value + " 00:00:00 UTC" ,d3.select("#datePickerStart")[0][0].value + " 23:59:59 UTC"];
		} else if (timeFrame === "This Year"){
			avgOver = 21600;
			var januaryFirst = "01/01/" + todayFormated.split("/")[2];
			queryDate = [ januaryFirst + " 00:00:00 UTC" ,todayFormated + " " + timeFormated + " UTC"];
		} else if (timeFrame === "This Month"){
			avgOver = 720;
			var monthFirst = todayFormated.split("/")[0] + "/01/" + todayFormated.split("/")[2];
			queryDate = [ monthFirst + " 00:00:00 UTC" ,todayFormated + " 00:00:00 UTC"];
		} else if (timeFrame === "Last 7 days"){
			avgOver = 120;
			var sevenDaysBefore = dayFormat(new Date(today.getTime() - (7 * 24 * 60 * 60 * 1000)));
			queryDate = [ sevenDaysBefore + " 00:00:00 UTC" ,todayFormated + " " + timeFormated + " UTC"];
		}
		else if (timeFrame === "Today"){
			queryDate = [ todayFormated + " 00:00:00 UTC" ,todayFormated + " " + timeFormated + " UTC"];
		} else if (timeFrame === "Now"){
			avgOver = 1;
			var threeHoursBefore = new Date(today.getTime() - (60 * 60 * 1000));
			queryDate = [ todayFormated + " " + timeFormat(threeHoursBefore) + " UTC" ,todayFormated + " " + timeFormated + " UTC"];
		}
		queryObjects.push(new Query(queryType + " " + timeFrame + ": " + queryDate,queryDate))
		LoadData(queryObjects[counter].date,queryObjects[counter].queryText,avgOver);
	}
}