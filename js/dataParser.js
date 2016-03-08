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
		for (i in links){
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
	//Function to retrieve Dynamic Metadata on Start and fill up the first Overview. Sets the links and nodes to be visualized and parses data for the mapgraph and histogramTable.
	function OverviewTSDSQuery(url){
		//Set up the date
		var dateToday = ' "02/26/2016 00:00:00 UTC", "02/26/2016 00:00:00 UTC" ';
		var dateInterval = ' "02/26/2016 00:00:00 UTC", "02/26/2016 01:00:00 UTC" ';
		//Query to retrieve metadata values
		var url = 'https://netsage-archive.grnoc.iu.edu/tsds/services-basic/query.cgi?method=query;query=get node, intf, description, a_endpoint.latitude, a_endpoint.longitude, z_endpoint.latitude, z_endpoint.longitude, max_bandwidth between(' + dateToday + ') by node, intf from interface where a_endpoint != null and z_endpoint != null'
		d3.json(url)
			.on("beforesend", function (request) {request.withCredentials = true;})
			.get(function(error,data)
			{
				links = data.results;
				nodes = createNodes(nodes);
				mapGraph(nodes,links);
			});
		//Query to retrieve bandwith values
		url = 'https://netsage-archive.grnoc.iu.edu/tsds/services-basic/query.cgi?method=query;query=get https://netsage-archive.grnoc.iu.edu/tsds/services-basic/query.cgi?method=query;query=get node, intf, aggregate(values.input, 60, average) as input, aggregate(values.output, 60, average) as output between(' + dateInterval + ') by node, intf from interface where ( ( node = "mct02.miami.ampath.net" and intf = "ethernet2/5" ) or ( node = "mct01.miami.ampath.net" and intf = "ethernet2/5" ) or ( node = "rtr.losa.transpac.org" and intf = "xe-0/0/0" ) or ( node = "andeslight.sdn.amlight.net" and intf = "ethernet2/2" ) )'
		d3.json(url)
			.on("beforesend", function (request) {request.withCredentials = true;})
			.get(function(error,data)
			{
				histogramTableGraph(data.results);
			});
	}
	//#################################### END AUX FUNCTIONS ############################
	////Query to retrive metadata information
	OverviewTSDSQuery();
}

//var url= 'https://netsage-archive.grnoc.iu.edu/tsds/services/query.cgi?method=query;query=get%20intf,%20node,%20aggregate(values.input,%20300,%20average),%20aggregate(values.output,%20300,%20average)%20between(%2201/24/2016%2000:00:00%20UTC%22,%2201/25/2016%2000:00:00%20UTC%22)%20by%20node%20from%20interface%20where%20(%20node%20=%20%22rtr.losa.transpac.org%22)';
	//var url ='https://netsage-archive.grnoc.iu.edu/tsds/services-basic/query.cgi?method=query;query=get intf, node, aggregate(values.input, 300, average) as input, aggregate(values.output, 300, average) as output between("01/24/2016 00:00:00 UTC","01/25/2016 00:00:00 UTC") by node, intf from interface where ( node = "rtr.losa.transpac.org" and intf = "xe-0/0/0")';