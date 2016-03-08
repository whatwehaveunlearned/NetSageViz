function sortObjects (arr){
	var list = [];
	for(var element in arr){
		list.push([arr[element].node, arr[element].input.avg])
	}
	list.sort(function(a, b) {return a[1] - b[1]})
	var maxSpeed = {car:300, bike:60, motorbike:200, airplane:1000,
    helicopter:400, rocket:8*60*60}
    var list =[];
	var sortable = [];
	for (var vehicle in maxSpeed)
      sortable.push([vehicle, maxSpeed[vehicle]])
	sortable.sort(function(a, b) {return a[1] - b[1]})
}

function sortNumber(a,b) {
    return a - b;
}

//Average
function avg (arr){
	var sum=0;
	for (var each in arr){
		sum+=arr[each];
	}
	return sum/arr.length;
}
//Mode: Most commun value
function mode(){

}
//Median is the value that 50% are over and 50% are below
function median(arr){
	percentile(arr,50);
}

//Standart Deviation
function stdDev(arr){
	var sum =0;
	var average = avg(arr);
	for (var each in arr){
		sum+= Math.pow(arr[each]-average,2);
	}
	return Math.sqrt(sum/arr.length)
}
//Percentile function. Returns a pivot where the number of sorted elements in the left are <= index
function percentile(arr,index){
	var x = (arr.length*index)/100;
	var ordArr = arr.sort(sortNumber);
	if(x%1==0){
		return ordArr[Math.floor(x)+1];
	}else{
		return  (ordArr[Math.floor(x)]+ordArr[Math.floor(x)+1])/2;
	}
}