function LoadData(){
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
	         	for(each in out){
	         		//Save unique links conected to this node
	         		if(out[each].lat == item) uniqFast(out[each].links.push(object.links[0]))
	         	}
	         }
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
	function createNodes(){
		var allNodes;
		for (var i in links){
			var linkArray =[];
			nodes.push ( {
				name: links[i]["description"].split("<->")[0],
				lat: links[i]["a_endpoint.latitude"],
				lon: links[i]["a_endpoint.longitude"],
				links: [i]
			})
			nodes.push ( {
				name: links[i]["description"].split("<->")[1],
				lat: links[i]["z_endpoint.latitude"],
				lon: links[i]["z_endpoint.longitude"],
				links: [i]
			})
		}
		return uniqNodes(nodes);
	}
	function scaleAndClean (dataPoint,sizeInterval){
		var inputClean=[];
		var outputClean=[];
		for (each in dataPoint.input){
			if(dataPoint.input[each][1]!=null) inputClean.push(dataPoint.input[each][1]/8/1024/1024); // bit/bytes(div by 8)/KBs/MBs/
			if(dataPoint.output[each][1]!=null) outputClean.push(dataPoint.output[each][1]/8/1024/1024);
		}
		//Save the cleaned scaled values in the data
		dataPoint.input.histogram = inputClean;
		dataPoint.output.histogram = outputClean;
		//Create other helper Statistical values
		dataPoint.input.max = d3.max(inputClean);
		dataPoint.input.min = d3.min(inputClean);
		dataPoint.input.avg = avg(inputClean);
		dataPoint.input.median = median(inputClean);
		dataPoint.input.percentile25 = percentile(inputClean,25);
		dataPoint.input.percentile75 = percentile(inputClean,75);
		dataPoint.output.avg = avg(outputClean);
		dataPoint.output.median = median(outputClean);
		dataPoint.output.percentile25 = percentile(outputClean,25);
		dataPoint.output.percentile75 = percentile(outputClean,75);
		dataPoint.output.max = d3.max(outputClean);
		dataPoint.output.min = d3.min(outputClean);
		dataPoint.totalData = [avg(inputClean)*sizeInterval,avg(outputClean)*sizeInterval];
	}
	//Function to retrieve Dynamic Metadata on Start and fill up the first Overview. Sets the links and nodes to be visualized and parses data for the mapgraph and histogramTable.
	function OverviewTSDSQuery(url){
		//Set up the date
		//one hour date
		var date = ["02/26/2016 00:00:00 UTC", "02/26/2016 01:00:00 UTC"];
		//one day date
		//var date = ["02/26/2016 00:00:00 UTC", "02/27/2016 00:00:00 UTC"];
		//one month date
		//var date = ["01/26/2016 00:00:00 UTC", "02/26/2016 01:00:00 UTC"];
		var today = new Date();
		var interval = { first: new Date(date[0]), second: new Date(date[1]) }
		var sizeIntervalSeconds = (interval.second - interval.first)/1000
		var avgOver = 60;
		//Query to retrieve metadata values
		var url = 'https://netsage-archive.grnoc.iu.edu/tsds/services-basic/query.cgi?method=query;query=get node, intf, description, a_endpoint.latitude, a_endpoint.longitude, z_endpoint.latitude, z_endpoint.longitude, max_bandwidth between( "' + date[0] + '", "' + date[1] + '" ) by node, intf from interface where a_endpoint != null and z_endpoint != null'
		d3.json(url)
			.on("beforesend", function (request) {request.withCredentials = true;})
			.get(function(error,data)
			{
				links = data.results;
				//Remove the empty value THIS IS TEMPORAL HACK!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
				//links.splice(8,1);
				//Remove the empty value THIS IS TEMPORAL HACK!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
				data.results.splice(5,1);
				nodes = createNodes(nodes);
				//Query to retrieve bandwith values
				url = 'https://netsage-archive.grnoc.iu.edu/tsds/services-basic/query.cgi?method=query;query=get https://netsage-archive.grnoc.iu.edu/tsds/services-basic/query.cgi?method=query;query=get node, intf, aggregate(values.input,' + avgOver + ', average) as input, aggregate(values.output,' + avgOver + ', average) as output between( "' + date[0] + '", "' + date[1] + '" ) by node, intf from interface where ( '
				for (var each in links){
					if (each != links.length-1) url = url + '( node = "' + links[each].node + '" and intf = "' + links[each].intf + '") or ';
					else url = url + '( node = "' + links[each].node + '" and intf = "' + links[each].intf + '") )';
				}
				d3.json(url)
				.on("beforesend", function (request) {request.withCredentials = true;})
				.get(function(error,data)
				{
					for (element in data.results){
						scaleAndClean(data.results[element],sizeIntervalSeconds);
					}
					queryData = data;
					console.log(data.results);
					mapGraph(nodes,links,data);
					histogramTableGraph(data.results);
				});
			});
	}
	//#################################### END AUX FUNCTIONS ############################
	////First Query to retrive metadata information and create overview
	OverviewTSDSQuery();
}