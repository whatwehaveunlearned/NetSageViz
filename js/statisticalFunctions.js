function sortObjects (arr,type){
	var sort;
	switch(type){
		case "dec":
			sort = arr.sort(function(a, b) {return b.data.input.avg - a.data.input.avg});
			break;
		case "inc":
			sort = arr.sort(function(a, b) {return a.data.input.avg - b.data.input.avg});
			break;
		//increasing order as default
		default:
			sort = arr.sort(function(a, b) {return b.data.input.avg - a.data.input.avg});
			break;
	}
	return sort;
}

function sortNumber(a,b,type) {
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