var demVoters = [110548, 190158, 126739, 113984, 175851, 152810, 139133, 96207, 137785, 109391, 176945, 213197, 254996, 174555, 166820, 114496, 127752, 168333, 141411, 157707, 96898, 98773, 91548, 126929, 138765, 147117, 156738, 186843, 149088, 195793, 123096, 149584, 201383, 148353, 121005, 105253, 245199, 174956, 113792, 149079, 111683, 86941, 208887, 196756, 105196, 106250, 158790, 106771, 104027, 89608, 124064, 123977, 153213]

var votesJson={};  // pass back as JSON
for(var i=0;i<demVoters.length;i++){
  votesJson[i]=demVoters[i];
}

var sqlite3 = require("sqlite3");
var censusDB = new sqlite3.Database("census.db");
var pollsDB = new sqlite3.Database("polls.db");

function dataSearch(query,response){
	console.log("Querying the census database");
	censusDB.all("SELECT " + query + " FROM Census",
		function(err,data){
			if(err) console.log(err);
			response.write(JSON.stringify(data));
			response.end();
		});
}


function queryServer(request,response,search) {
    response.writeHead(200, {"Content-Type": "application/json"});
    search = search.replace('?','');
    if(search == 'model'){
    	model(response);
    }else if(search == 'api'){
      pollsAPICallback(response);
    }else{
    	dataSearch(search,response);
    }
}

exports.queryServer = queryServer;

var pollData = [];
var censusData = [];

function calculate(response){
	if(pollData.length== 0 || censusData.length == 0){
		console.log("waiting");
		return;
	}
	console.log('ready');

	//handle undecided
	var pop_percent ={};
	for(var i=0;i<pollData.length;i++){
		var hill = pollData[i].hillary;
		var ben = pollData[i].bernie;
		var undecided = pollData[i].undecided;
		var res= {};
		res.hillary = (undecided*(hill/(hill+ben))+hill)/100;
		res.bernie = 1-res.hillary;

		pop_percent[pollData[i].population] = res;
	}
	//console.log(pop_percent);

	var votes = [];
	for(var i=0;i<demVoters.length;i++){
		var totalVotes=demVoters[i];
		var ownerVotes=totalVotes*censusData[i].Owner_occupied;
		var renterVotes=totalVotes*censusData[i].Renter_occupied;

		var bernieVotes=Math.round(ownerVotes*pop_percent.Homeowner.bernie+
			renterVotes*pop_percent['Renter/other'].bernie);
		var hillVotes=totalVotes - bernieVotes;

		votes.push({hillV:hillVotes,bernieV:bernieVotes});
	}
	//console.log(votes);

	pollData=[];
	censusData=[];
	response.write(JSON.stringify(votes));
	response.end();
}

function model(response){
	console.log("Taking house hold poll");
	pollsDB.all("SELECT * FROM Polls WHERE population='Renter/other' \
		OR population='Homeowner'",
		function(err, data){
			if(err) console.log(err);
			pollData = data;
			//console.log(pollData);
			calculate(response);
		});

	console.log("Taking house hold census");
	censusDB.all("SELECT Owner_occupied,Renter_occupied FROM Census",
		function(err, data){
			if(err) console.log(err);
			censusData = data;
			//console.log(censusData);
			calculate(response);
		});
}

var http  = require('http');
var request = require('request');

// Parsing the returned JSON
function listResponse(body) {
  pollList = JSON.parse(body);
  //console.log(pollList);
  contest = "2016 California Democratic Presidential Primary";
  var data = [];  
  for (var i=0;i<3;i++){
    var question = pollList[i].questions;
    var each = {};
    for(var j=0;j<question.length;j++){
      if (question[j].name == contest) {
         subpop = question[j].subpopulations;
         for (var k=0; k<subpop.length; k++) {
           each['data'] = subpop[k];
           each['date'] = pollList[i].end_date;
           each['name'] = pollList[i].pollster;
         }
      }
    }
    data.push(each);
  }
  return data;
}

function pollsAPICallback(response){
  requestString = "http://elections.huffingtonpost.com/pollster/api/polls.json?page=1&state=CA&after=2016-04-20";
  request (requestString, function (error, resp, body) { 
    if (!error && resp.statusCode == 200) {
	    var data = listResponse(body);
      //console.log(data);
      response.write(JSON.stringify(data));
      response.end();   
    } else {
        console.log("huffpo says error", error);
    }
  });
}