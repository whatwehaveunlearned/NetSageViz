//Every 60 seconds we execute the query again
setInterval(main, 60000);
function main (){
	$(".querySelector").remove();
	$(".applicationRegion").remove()
	dashboardForm();
	$("#queryForm").remove();
}

function dashboardForm(){
	//We put the logo and links between Dashboard and Main
	var logoWidth = 90;
	var logoHeight = 90;
	var querySelector = d3.select("body").append("div")
				.attrs({
					class:"querySelector"
				});
			querySelector.append("img")
				.attrs({
					"src":"logoNoShadow.png",
					"width":logoWidth,
					"height":logoHeight
				});
			querySelector.append("span")
			.attrs({
				"class":"dashboardTitle"
			})
			.html("NetSage Dashboard");
			var goBack = querySelector.append("span")
				.attrs({
					"class":"goBack"
				})
				.html("Ask NetSage...")
				.on("click",function(){ window.location.href="main.html"});
			goBack.append("span")
				.attrs({
				  "class":"ui-icon ui-icon-arrowthick-1-e arrowGoBack"
				 })
				.on("click",function(){ window.location.href="main.html"});
	//QueryFormVariables Array of Options
	var queryTypes;
	var queryMeasures;
	var queryValues;
	var timeFrames;
	var queryFromTab=undefined;
	queryTypes = ["What was the min, max, average ","What is the duration and are there any periodic patterns or peak periods ", "More to come... "];
	queryMeasures = ["in Bandwidth use"," in Losses"];
	queryValues = ["across the IRNC Network","across the IRNC Links","across the IRNC Nodes"];
	timeFrames = ["now","today","last 7 days","this month","this year","time frame"];
	drawQueryForm(queryTypes,queryMeasures,queryValues,timeFrames);
	//Prefill with the pickers with the now data
	day = new Date();
	var threeHoursBefore = new Date(day.getTime() - (3 * 60 * 60 * 1000));
	createDatePickers(threeHoursBefore,day,true);
	handleOnClick(day,false,queryFromTab);
}

function drawQueryForm(queryTypes,queryMeasures,queryValues,timeFrames){
		var querySelector = d3.select("body").append("div")
			.attrs({
				class:"querySelector"
			});
		var queryForm=querySelector.append("form")
			.attrs({
				"id":"queryForm"
			});
		var fieldset = queryForm.append("fieldset")
							.attrs({
								"id":"fieldset"
							});
		fieldset.append("span")
				.attrs({
					id:"fieldsetTitle"
				})
				.html("Ask NetSage...");
		drawQueryFormCommon(queryForm,fieldset,queryTypes,queryMeasures,queryValues,timeFrames);
}