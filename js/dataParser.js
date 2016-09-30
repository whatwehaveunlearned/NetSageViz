function LoadData(queryDate,queryText,avgOver,queryType){
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
	    	var linkData = [];
	    	//We cleaned the data of the links so we only need to calculate the aggregate data for nodes getting it from their links.
	    	var inputNodeData = {};
	    	var outputNodeData = {};
	    	var inputNodeDataHistogram = [];
	    	var outputNodeDataHistogram = [];
	    	for (var each in out[element].links){
	    		linkData.push(links[parseInt(out[element].links[each],10)].data);
	    		inputNodeDataHistogram = inputNodeDataHistogram.concat(links[parseInt(out[element].links[each],10)].data.input.histogram);
	    		outputNodeDataHistogram = outputNodeDataHistogram.concat(links[parseInt(out[element].links[each],10)].data.output.histogram);
	    	}
	    	out[element].data.linkData = linkData;
	    	out[element].data.input.histogram = inputNodeDataHistogram;
	    	out[element].data.output.histogram = outputNodeDataHistogram;
	    	//To get the data of the nodes I create an object where the index is the time and the value is the data, if the index exists add the data if it doesnt create it and add the data of the link
	    	//I need to do this because the links have different amount of times because not all of them started getting data at the same time.
	    	for(var i in out[element].links){
	    		for(var each in out[element].data.linkData[i].input.values){
	    			if (inputNodeData[out[element].data.linkData[i].input.values[each][0]] === undefined) inputNodeData[out[element].data.linkData[i].input.values[each][0]] = out[element].data.linkData[i].input[each][1];
	    			else inputNodeData[out[element].data.linkData[i].input.values[each][0]] += out[element].data.linkData[i].input.values[each][1];
	    			if (outputNodeData[out[element].data.linkData[i].output.values[each][0]] === undefined) outputNodeData[out[element].data.linkData[i].output.values[each][0]] = out[element].data.linkData[i].output[each][1];
	    			else outputNodeData[out[element].data.linkData[i].output.values[each][0]] += out[element].data.linkData[i].output.values[each][1];
	    		}
	    	}
	    	out[element].data.input.values = objToArray(inputNodeData);
	    	out[element].data.output.values = objToArray(outputNodeData);
	    }
	    return out;
	}
	//Function to transform object to array
	function objToArray(obj){
		var dataArray = new Array;
		for(var i in obj) {
		    dataArray.push([new Date(i),obj[i]]);
		}
		return dataArray;
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
		var inputValues = [];
		var outputValues = [];
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
			inputValues.push([new Date (dataPoint.input[each][0]*1000),dataPoint.input[each][1]]);
			outputValues.push([new Date (dataPoint.output[each][0]*1000),dataPoint.output[each][1]]);
		}
		//Save the cleaned scaled values in the data
		dataPoint.input.histogram = inputClean;
		dataPoint.output.histogram = outputClean;
		dataPoint.input.values = inputValues;
		dataPoint.output.values = outputValues;
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
		//min and max dates (dates are the same for all and are the same for input and output)
		dataPoint.minDate = dataPoint.input.values[0][0];
		dataPoint.maxDate = dataPoint.input.values[dataPoint.input.values.length-1][0];

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
	function snmpTSDSQuery(avgOver){
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
					//Create query text
					drawQueryText(queryText);
					if(queryObjects[counter].queryType==="0"){//Bandwith accross links
						//Create Map
						mapGraph(queryObjects[counter]);
						//Create Table
						histogramTableGraph(queryObjects[counter]);
						lineChart(queryObjects[counter]);
					}else if(queryObjects[counter].queryType==="1"){//Periodic Patterns
						periodicPattern(queryObjects[counter]);
					}
					$("#whiteButtonImg").remove();
					$("#queryButtonImg").remove();
				});
			});
			function drawQueryText(queryText){
				d3.select("body").append("div")
				.attrs({
					"id": "AppRegion"+counter,
					"class": "applicationRegion"
				})
				.style("float","left")
				.append("div")
				.attrs({
					"id": "query"+counter,
					"class": "queryTextAppRegion"
				})
				.append("p")
				.html(queryText);
			}
	}
	//#################################### END AUX FUNCTIONS ############################
	////Loads the data for the query
	snmpTSDSQuery(avgOver);
}