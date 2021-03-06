//Global Variables
var windowWith = $(window).width();
var windowHeight = $(window).height();
var links;
var results;
var queryObjects = [];
var counter=-1;

//Query Object Prototype
function Query(query,date,avgOver,queryType,queryMeasure){
	this.queryText = query;
	this.date = date;
	this.links = 0;
	this.nodes = 0;
	this.avgOver = avgOver;
	this.queryType = queryType;
	this.queryMeasure = queryMeasure;
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

//Function to fill up and create the necesarry datePickers depending on the selected TimeFrame
function createDatePickers(startDate,stopDate,isNow){
	var dayFormat = d3.timeFormat("%m/%d/%Y");
	var timeFormat = d3.timeFormat("%H:%M");
	$('#dateHourDiv').remove();
	var fieldset = d3.select("#fieldset");
	if (isNow==true) var hoursSelectionStart = [timeFormat(startDate),"00:00","01:00","02:00","03:00","04:00","05:00","06:00","07:00","08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00","19:00","20:00","21:00","22:00","23:00"];
	else var hoursSelectionStart = ["00:00","01:00","02:00","03:00","04:00","05:00","06:00","07:00","08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00","19:00","20:00","21:00","22:00","23:00"];
	if (startDate != "") var StartDateFormated = dayFormat(startDate);
	else var StartDateFormated = "";
	var dateHourDiv = fieldset.append("div")
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

//Function to create URL to add to a new tab with the query.
function getQuery(queryDate,avgOver,queryType,queryName,queryMeasure,queryValue){
	var urlParam = [];
	urlParam.push(encodeURI("date") + "=" + encodeURI(queryDate));
	urlParam.push(encodeURI("avgOver") + "=" + encodeURI(avgOver));
	urlParam.push(encodeURI("queryType") + "=" + encodeURI(queryType));
	urlParam.push(encodeURI("queryName") + "=" + encodeURI(queryName));
	urlParam.push(encodeURI("queryMeasure") + "=" + encodeURI(queryMeasure));
	urlParam.push(encodeURI("queryValue") + "=" + encodeURI(queryValue));
	return "main.html?" + urlParam.join("&");
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
//Functions to populate the Form.
function populateFormValues(){
	//Populate queryForm Values
	var queryTypes = ["What was the min, max, average ","What is the duration and are there any periodic patterns or peak periods ", "More to come... "];
	var queryMeasures = ["in Bandwidth use"," in Losses"];
	var queryValues = ["across the IRNC Network","across the IRNC Links","across the IRNC Nodes"];
	if(getUrlParameter("date")!=undefined) var timeFrames = ["time frame","now","today","last 7 days","this month","this year"];
	else var timeFrames = ["now","today","last 7 days","this month","this year","time frame"];
}

function drawQueryFormCommon(queryForm,fieldset,queryTypes,queryMeasures,queryValues,timeFrames,day){
	//Create Query Type Select
		//Insert svg Circle as bullet for list
		fieldset.append("svg")
				.attrs({
					"class":"bullets",
					"width":"2em",
					"height":"2em"
				})
				.styles({
					"top":"2em",
					"left":"-2em"
				})
				.append("circle")
				.attrs({
					"cx":20,
					"cy":20,
					"r":7
				})
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
				.attrs({
					"value":i,
					"id":"typeOption"+i
				})
				.html(queryTypes[i]);
		}
		//Insert svg Circle as bullet for list
		fieldset.append("svg")
				.attrs({
					"class":"bullets",
					"width":"2em",
					"height":"2em"
				})
				.styles({
					"left":"-2em",
					"top":"-0.5em"
				})
				.append("circle")
				.attrs({
					"cx":20,
					"cy":20,
					"r":7
				})
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
				.attrs({
					"value":i,
					"id":"measureOption" + i
				})
				.html(queryMeasures[i]);
		}
		//Insert svg Circle as bullet for list
		fieldset.append("svg")
				.attrs({
					"class":"bullets",
					"width":"2em",
					"height":"2em"
				})
				.styles({
					"top":"-3em",
					"left":"-2em"
				})
				.append("circle")
				.attrs({
					"cx":20,
					"cy":20,
					"r":7
				})
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
				.attrs({
					"value":i,
					"id": "valueOption" +i
				})
				.html(queryValues[i]);
		}
		//Insert svg Circle as bullet for list
		fieldset.append("svg")
				.attrs({
					"class":"bullets",
					"width":"2em",
					"height":"2em"
				})
				.styles({
					"top":"-5.3em",
					"left":"-2em"
				})
				.append("circle")
				.attrs({
					"cx":20,
					"cy":20,
					"r":7
				})
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
		//Convert to Jquery select menus. Performs the updates of the menus on the selection options changing time frames options depending on the question.
		$("#queryType").selectmenu({
			change: function( event, data ) {
				var day = new Date();
				var timeFrames = ["now","today","last 7 days","this month","this year","time frame"];
				if(data.item.value==="1"){ //Question 1
					//Enable losse and latency measures when we select question 1
					$("#measureOption1").attr("disabled",false);
					$("#measureOption2").attr("disabled",false);
					var queryTimeFrame = $("#queryTimeFrame");
					queryTimeFrame.empty();
					queryTimeFrame.append('<option>this month</option><option>this year</option><option>time frame</option>')
					queryTimeFrame.selectmenu("refresh");
					//Refresh menu to put first day of the month
					var monthFirst = new Date(day.getFullYear(), day.getMonth(), 1);
					createDatePickers(monthFirst,day,false);
				}else{ //Other questions
					///Disable losse and latency measures when we select question 1
					//The menu is redrawn because there was a bug that when you selected latency and losses and changed to question one you could be able to question the app with that measure even though it was disabled.
					$("#queryMeasure").empty();
					for (var i in queryMeasures){
						queryMeasureSelect.append("option")
							.attrs({
								"value":i,
								"id":"measureOption" + i
							})
							.html(queryMeasures[i]);
					}
					//$("#queryMeasure").selectmenu("option","disabled",true);
					$("#measureOption1").attr("disabled",true);
					$("#measureOption2").attr("disabled",true);
					var queryTimeFrame = d3.select("#queryTimeFrame");
					$("#queryTimeFrame").empty();
					for (var i in timeFrames){
						queryTimeFrame.append("option")
							.html(timeFrames[i]);
					}
					$("#queryTimeFrame").selectmenu("refresh");
				}
				$("#queryMeasure").selectmenu("refresh");
			},
			width : 'auto'
		});
		//Disable question that is not acive
		$("#typeOption2").attr("disabled",true);
		$("#queryMeasure").selectmenu({
			width : 'auto'
		});
		//On start we disable the other queryValue options until we add the part of the code to process them.
		$("#measureOption1").attr("disabled",true);
		$("#measureOption2").attr("disabled",true);
		$("#queryValue").selectmenu({
			width : 'auto'
		});
		//On start we dont allow to select measures for the first question its not on place jet.
		$("#valueOption1").attr("disabled",true);
		$("#valueOption2").attr("disabled",true);
		$("#queryTimeFrame").selectmenu({
	      change: function( event, data ) {
			var day = new Date();
			$( "#datePickerStart" ).remove();
			$( "#datePickerEnd" ).remove();
	      	//If we select Time Frame create 2 empty datePickers
	        if(data.item.label==="time frame"){
	        	createDatePickers("","",false);
			//For the specified ranges we fill up the date pickers
	        }else if(data.item.label==="this year"){
	        	var januaryFirst = new Date(new Date().getFullYear(), 0, 1);
	        	createDatePickers(januaryFirst,day,false);
	         }else if(data.item.label==="this month"){
				var monthFirst = new Date(day.getFullYear(), day.getMonth(), 1);
				createDatePickers(monthFirst,day,false);
			 }else if(data.item.label==="last 7 days"){
	        	var sevenDaysBefore = new Date(day.getTime() - (7 * 24 * 60 * 60 * 1000));
				createDatePickers(sevenDaysBefore,day,false);
			}else if(data.item.label==="today"){
				createDatePickers(day,day,false);
			}else if(data.item.label==="now"){
				var threeHoursBefore = new Date(day.getTime() - (3 * 60 * 60 * 1000));
				createDatePickers(threeHoursBefore,day,true);
	    	}
	      },
	      width:'auto'
	     });

		var queryFormButton = queryForm.append("button")
			.attrs({
				"type":"button",
				"id":"submit"
			})
			.on("click", function() {handleOnClick(day,false)});
		queryFormButton.append("span")
			.append("img")
			.attrs({
				"id":"playbuttonImg",
				"src":"playArrow2.png",
				"width":"50em",
				"height":"50em"
			})
}
//Function that manages the Mouseclick on the play button
function handleOnClick(date,fromURL,queryFromTab){
	queryComposer(date,fromURL,queryFromTab);
}//Function that reads the query
function queryComposer(date,fromURL,queryFromTab){
	var dayFormat = d3.timeFormat("%m/%d/%Y");
		var timeFormat = d3.timeFormat("%H:%M:%S");
		//variables to hold type,name,measure,value and timeframe from query, either from the previous tab or from the elements in the actual form.
		var queryType;
		var queryName;
		var queryMeasure;
		var queryMeasureText;
		var queryValue;
		var timeFrame;
		var queryDate;
		var queryDateLocalTime;
		//Add Giff image while loading it replaces the text in the button. The giff is replaced back to the text at the end of the query. I do that in the main function (TOP)
		d3.select("#submit").append("span")
			.append("img")
			.attrs({
				"id":"whiteButtonImg",
				"src":"whiteSquareButton.jpeg",
				"width":"25em",
				"height":"25em"
			})
		d3.select("#submit").append("span")
			.append("img")
			.attrs({
				"id":"queryButtonImg",
				"src":"opc-ajax-loader.gif",
				"width":"35em",
				"height":"35em"
			})
		//Increase counter
		counter=counter+1;
		//Read query type
		if(queryFromTab !== undefined && fromURL === true){
			queryType = queryFromTab.queryType;
			queryName = queryFromTab.queryName;
			queryValue = queryFromTab.queryValue;
			queryMeasure = queryFromTab.queryMeasure;
		}else{
			queryType = $("#queryType")[0].value;
			queryName = $("#queryTypeDiv option:selected").html();
			queryMeasure = $("#queryMeasureDiv option:selected")[0].value;
			queryMeasureText = $("#queryMeasureDiv option:selected").html();
			queryValue = $("#queryValueDiv option:selected").html()
		}
		//Read TimeFrame
		timeFrame = $("#queryTimeFrame")[0].value
		//Read Dates
		if(getUrlParameter("avgOver")!=undefined && fromURL===true) var avgOver = parseInt(getUrlParameter("avgOver"),10);
		else var avgOver = 900;
		//UTC date
		var UTCDateStart;
		var UTCDateStop;
		queryDateLocalTime = [d3.select("#datePickerStart")._groups[0][0].value + " at " + d3.select("#timeStart")._groups[0][0].value , d3.select("#datePickerEnd")._groups[0][0].value + " at " + d3.select("#timeStop")._groups[0][0].value]
		UTCDateStart = new Date(d3.select("#datePickerStart")._groups[0][0].value + " " + d3.select("#timeStart")._groups[0][0].value )
		UTCDateStart = new Date(UTCDateStart.getUTCFullYear(), UTCDateStart.getUTCMonth(), UTCDateStart.getUTCDate(),  UTCDateStart.getUTCHours(), UTCDateStart.getUTCMinutes(), UTCDateStart.getUTCSeconds());
		UTCDateStop = new Date(d3.select("#datePickerEnd")._groups[0][0].value + " " + d3.select("#timeStop")._groups[0][0].value )
		UTCDateStop = new Date(UTCDateStop.getUTCFullYear(), UTCDateStop.getUTCMonth(), UTCDateStop.getUTCDate(),  UTCDateStop.getUTCHours(), UTCDateStop.getUTCMinutes(), UTCDateStop.getUTCSeconds());
		console.log(UTCDateStart);
		console.log(UTCDateStop);
		if (timeFrame === "time frame") {
			avgOver = 3600; //get avg per each hour. This is the data format the heatmaps are expecting.
			queryDate = [dayFormat(UTCDateStart) + " " + timeFormat(UTCDateStart) + " UTC" ,dayFormat(UTCDateStop) + " " + timeFormat(UTCDateStop) + " UTC"];
		}else if (timeFrame === "this year"){
			avgOver = 3600;
			queryDate = [dayFormat(UTCDateStart) + " " + timeFormat(UTCDateStart) + " UTC" ,dayFormat(UTCDateStop) + " " + timeFormat(UTCDateStop) + " UTC"];
		} else if (timeFrame === "this month"){
			if(queryType==="1") avgOver = 3600;
			queryDate = [dayFormat(UTCDateStart) + " " + timeFormat(UTCDateStart) + " UTC" ,dayFormat(UTCDateStop) + " " + timeFormat(UTCDateStop) + " UTC"];
		} else if (timeFrame === "last 7 days"){
			if(queryType==="0") avgOver = 60;
			if(queryType==="1") avgOver = 3600;
			queryDate = [dayFormat(UTCDateStart) + " " + timeFormat(UTCDateStart) + " UTC" ,dayFormat(UTCDateStop) + " " + timeFormat(UTCDateStop) + " UTC"];
		}
		else if (timeFrame === "today"){
			if(queryType==="0") avgOver = 1;
			if(queryType==="1") avgOver = 3600;
			queryDate = [dayFormat(UTCDateStart) + " " + timeFormat(UTCDateStart) + " UTC" ,dayFormat(UTCDateStop) + " " + timeFormat(UTCDateStop) + " UTC"];
		} else if (timeFrame === "now"){
			if(queryType==="0") avgOver = 1;
			else if(queryType==="1") avgOver = 3600;
			queryDate = [dayFormat(UTCDateStart) + " " + timeFormat(UTCDateStart) + " UTC" ,dayFormat(UTCDateStop) + " " + timeFormat(UTCDateStop) + " UTC"];
		}
		queryObjects.push(new Query(queryName + " " + queryMeasureText + " " + queryValue + " " + timeFrame + ": From " + queryDateLocalTime[0] + ", to " + queryDateLocalTime[1] + " (" + new Date().toString().match(/\(([A-Za-z\s].*)\)/)[1] + ") ", queryDate, avgOver, queryType,queryMeasure))
		//when we make a second query in the same page we open a new tab.
		if($("#query0")[0]!==undefined){
			$("#whiteButtonImg").remove();
			$("#queryButtonImg").remove();
			url = getQuery(queryDate,avgOver,queryType,queryName,queryMeasure,queryValue);
			myWindow = window.open(url,'_blank');
			myWindow.focus();
		}else{
			LoadData(queryObjects[counter].date,queryObjects[counter].queryText,queryObjects[counter].avgOver,queryObjects[counter].queryType,queryObjects[counter].queryMeasure);
		}
}