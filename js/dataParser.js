function LoadData(queryDate,queryText,avgOver){
	//#################################### AUX FUNCTIONS ############################
	//Function return unique nodes from links
	function uniqNodes(a) {
	    var seen = {};
	    var out = [];
	    var len = a.length;
	    var j = 0;
	    for(var i = 0; i < len; i++) {
	    	var object = a[i]
	         var item = a[i].lat;
	         if(seen[item] !== 1) {
	               seen[item] = 1;
	               out[j++] = object;
	         }else{
	         	for(var each in out){
	         		//Save unique links conected to this node
	         		if(out[each].lat == item){
	         			uniqFast(out[each].links.push(object.links[0]))
	         		}
	         	}
	         }
	    }
	    for (var element in out){
	    	var linkData =[];
	    	//We cleaned the data of the links so we only need to calculate the aggregate data for nodes getting it from their links.
	    	var inputNodeData = [];
	    	var outputNodeData = [];
	    	for (var each in out[element].links){
	    		linkData.push(links[parseInt(out[element].links[each])].data);
	    		inputNodeData = inputNodeData.concat(links[parseInt(out[element].links[each])].data.input.histogram);
	    		outputNodeData = outputNodeData.concat(links[parseInt(out[element].links[each])].data.output.histogram);
	    	}
	    	out[element].data.linkData = linkData;
	    	out[element].data.input.histogram = inputNodeData;
	    	out[element].data.output.histogram = outputNodeData;
	    }
	    return out;
	}
	//Return unique links values for links[i].links array. (Removes repeated values.)
	function uniqFast(a) {
	    var seen = {};
	    var out = [];
	    var len = a.length;
	    var j = 0;
	    for(var i = 0; i < len; i++) {
	    	var object = a[i]
	         var item = a[i].name;
	         if(seen[item] !== 1) {
	               seen[item] = 1;
	               out[j++] = object;
	         }
	    }
	    return out;
	}
	//Helper function to create nodes Object
	function createNodes(nodes){
		var allNodes;
		for (var i in links){
			var linkArray =[];
			nodes.push ( {
				node: links[i]["a_endpoint.name"],
				lat: links[i]["a_endpoint.latitude"],
				lon: links[i]["a_endpoint.longitude"],
				links: [i],
				data: {
					input:{histogram:[]},
					output:{histogram:[]}
				}
			})
			nodes.push ( {
				node: links[i]["z_endpoint.name"],
				lat: links[i]["z_endpoint.latitude"],
				lon: links[i]["z_endpoint.longitude"],
				links: [i],
				data: {
					input:{histogram:[]},
					output:{histogram:[]}
				}
			})
		}
		return uniqNodes(nodes);
	}

	//Function to clean data
	function scaleAndClean(dataPoint){
		var inputClean=[];
		var outputClean=[];
		//change this to the d3 assignment forEach
		for (each in dataPoint.input){
			if(dataPoint.input[each][1]!=null){
				dataPoint.input[each][1] = dataPoint.input[each][1]/1024/1024 // bit/Kbs/Mbs/
				inputClean.push(dataPoint.input[each][1]);
			}else{
				dataPoint.input[each][1] = 0;
				inputClean.push(0);
			}
			if(dataPoint.output[each][1]!=null){
				dataPoint.output[each][1] = dataPoint.output[each][1]/1024/1024;
				outputClean.push(dataPoint.output[each][1]);
			} else{
				dataPoint.output[each][1] = 0;
				outputClean.push(0);
			}
		}
		//Save the cleaned scaled values in the data
		dataPoint.input.histogram = inputClean;
		dataPoint.output.histogram = outputClean;
	}
	//Function to calculate Important Statistical values
	function calculateStatistics (dataPoint,sizeInterval){
		//Create other helper Statistical values
		dataPoint.input.max = d3.max(dataPoint.input.histogram);
		dataPoint.input.min = d3.min(dataPoint.input.histogram);
		dataPoint.input.avg = d3.mean(dataPoint.input.histogram);
		dataPoint.input.median = median(dataPoint.input.histogram);
		dataPoint.input.percentile25 = percentile(dataPoint.input.histogram,25);
		dataPoint.input.percentile75 = percentile(dataPoint.input.histogram,75);
		dataPoint.output.avg = d3.mean(dataPoint.output.histogram);
		dataPoint.output.median = median(dataPoint.output.histogram);
		dataPoint.output.percentile25 = percentile(dataPoint.output.histogram,25);
		dataPoint.output.percentile75 = percentile(dataPoint.output.histogram,75);
		dataPoint.output.max = d3.max(dataPoint.output.histogram);
		dataPoint.output.min = d3.min(dataPoint.output.histogram);

		if(dataPoint.input.histogram.length == 0){
			dataPoint.input.max = 0;
			dataPoint.input.min = 0;
			dataPoint.input.avg = 0;
			dataPoint.input.median = 0;
			dataPoint.input.percentile25 = 0;
			dataPoint.input.percentile75 = 0;
		}
		if (dataPoint.output.histogram.length == 0){
			dataPoint.output.max = 0;
			dataPoint.output.min = 0;
			dataPoint.output.avg = 0;
			dataPoint.output.median = 0;
			dataPoint.output.percentile25 = 0;
			dataPoint.output.percentile75 = 0;
		}

			dataPoint.totalData = [d3.mean(dataPoint.input.histogram)*sizeInterval,d3.mean(dataPoint.output.histogram)*sizeInterval];
			if(isNaN(dataPoint.totalData[0])) dataPoint.totalData[0]=0;
			if(isNaN(dataPoint.totalData[1])) dataPoint.totalData[1]=0;
	}

	//Function to retrieve Dynamic Metadata on Start and fill up the first Overview. Sets the links and nodes to be visualized and parses data for the mapgraph and histogramTable.
	function OverviewTSDSQuery(avgOver){
		//Set up the date
		var date = queryDate;
		var interval = { first: new Date(date[0]), second: new Date(date[1]) }
		var sizeIntervalSeconds = (interval.second - interval.first)/1000
		var avgOver = avgOver;
		var nodes = [];
		//Query to retrieve metadata values
		var url = 'https://netsage-archive.grnoc.iu.edu/tsds/services-basic/query.cgi?method=query;query=get node, intf, description, a_endpoint.name, a_endpoint.latitude, a_endpoint.longitude, z_endpoint.name, z_endpoint.latitude, z_endpoint.longitude, max_bandwidth between( "' + date[0] + '", "' + date[1] + '" ) by node, intf from interface where a_endpoint != null and z_endpoint != null'
		d3.json(url)
			.on("beforesend", function (request) {request.withCredentials = true;})
			.get(function(error,data)
			{
				links = data.results;
				queryObjects[counter].links = links;
				url = 'https://netsage-archive.grnoc.iu.edu/tsds/services-basic/query.cgi?method=query;query=get node, intf, aggregate(values.input,' + avgOver + ', average) as input, aggregate(values.output,' + avgOver + ', average) as output between( "' + date[0] + '", "' + date[1] + '" ) by node, intf from interface where ( '
				for (var each in links){
					if (each != links.length-1) url = url + '( node = "' + links[each].node + '" and intf = "' + links[each].intf + '") or ';
					else url = url + '( node = "' + links[each].node + '" and intf = "' + links[each].intf + '") )';
				}
				d3.json(url)
				.on("beforesend", function (request) {request.withCredentials = true;})
				.get(function(error,data)
				{
					for (var element in links){
						//Select appropiate data from array and attach it to the proper link
						var elementResult = data.results.filter(function( obj ) {
  							return obj.node == queryObjects[counter].links[element].node;
						});
						//Add the data to the links object
						queryObjects[counter].links[element].data = elementResult[0];
						scaleAndClean(queryObjects[counter].links[element].data);
						calculateStatistics(queryObjects[counter].links[element].data,sizeIntervalSeconds);
					}
					//Create the nodes from the links
					nodes = createNodes(nodes);
					queryObjects[counter].nodes = nodes;
					for (var element in nodes){
						calculateStatistics(nodes[element].data,sizeIntervalSeconds);
					}
					//####### Print the query to console used to do tests.
					var text = "["
					for(var i=0;i<queryObjects[counter].links[0].data.input.length;i++){
						text = text + "[" +queryObjects[counter].links[0].data.input[i][0] + "," + queryObjects[counter].links[0].data.input[i][1] + "],"
					}
					text = text + "]"
					console.log(text);
					//####### END Print the query to console used to do tests.
					//Create query text
					drawQueryText(queryText);
					drawSaveButton();
					//Create Map
					mapGraph(queryObjects[counter]);
					//Create Table
					histogramTableGraph(queryObjects[counter]);
				});
			});
			function drawQueryText(queryText){
				d3.select("body").append("div")
				.attrs({
					"id": "query"+counter,
					"class": "applicationRegion"
				})
				.append("p")
				.html("<b>Query "+ (counter+1) + ": </b>" + queryText);
			}
			function drawSaveButton(){
				d3.select("#query"+counter).append("button")
				.attrs({
					"id": "save-"+counter,
					"class":"saveButton"
				})
				.html("save query")
				.on("click", saveQuery)
			}
			function saveQuery(){
				var urlParam = [];
				var date = JSON.stringify(queryObjects[this.id.split("-")[1]].date);
				var queryText = queryObjects[this.id.split("-")[1]].queryText;
				var avgOver = JSON.stringify(queryObjects[this.id.split("-")[1]].avgOver);
				urlParam.push(encodeURI("date") + "=" + encodeURI(date));
				urlParam.push(encodeURI("queryText") + "=" + encodeURI([queryText]));
				urlParam.push(encodeURI("avgOver") + "=" + encodeURI(avgOver));
				d3.select("#query"+counter).append("p")
				  .html("http://netsagetest.s3-website-us-east-1.amazonaws.com/main.html?" + urlParam.join("&"))
				var completeURL = "http://netsagetest.s3-website-us-east-1.amazonaws.com/main.html?" + urlParam.join("&");
				copyToClipboard(completeURL);
				function copyToClipboard(text) {
				  // Create a "hidden" input
				  var aux = document.createElement("input");
				  // Assign it the value of the specified element
				  aux.setattrsibute("value", text);
				  // Append it to the body
				  document.body.appendChild(aux);
				  // Highlight its content
				  aux.select();
				  // Copy the highlighted text
				  document.execCommand("copy");
				  // Remove it from the body
				  document.body.removeChild(aux);

				}
			}
	}
	//#################################### END AUX FUNCTIONS ############################
	////Loads the data for the query
	OverviewTSDSQuery(avgOver);
}