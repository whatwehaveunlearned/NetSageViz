function tsdsQuery(){
	var url='https://data.cityofchicago.org/resource/alternative-fuel-locations.json?fuel_type_code=LPG';
	/*d3.json(url)
		.header("header-name","http://grnoc.iu.edu")
		//.header("Content-Type", "application/json")
		.get(function(error,data){
			console.log(data);
		});
	*/
	d3.json(url,function(error,data){
		console.log(data);
	})
}