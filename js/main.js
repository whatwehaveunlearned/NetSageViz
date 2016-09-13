//Global Variables
var windowWith = $(window).width();
var windowHeight = $(window).height();
var links;
var results;
var queryObjects = [];
var counter=-1;
function main (){
	queryForm();
}

//Query Object Prototype
function Query(query,date,avgOver,queryType){
	this.queryText = query;
	this.date = date;
	this.links = 0;
	this.nodes = 0;
	this.avgOver = avgOver;
	this.queryType = queryType;
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