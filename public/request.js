var map = {
  "Total population" : "population",
  "Median age (years)" : "Median_age",
  "White": "White",
  "Black or African American" : "Black_Africa_American",
  "American Indian and Alaska Native" : "American_Indian_Alaska_Native",
  "Asian" : "Asian",
  "Native Hawaiian and Other Pacific Islander" : "Native_Hawaiian_Pacific_Islander",
  "Hispanic or Latino (of any race)" : "Hispanic_Latino",
  "Born in the United States" : "Born_United_States",
  "Foreign born" : "Foreign_born",
  "Civilian veterans" : "Civilian_veterans",
  "Percent Unemployed" : "Percent_Unemployed",
  "Owner-occupied" : "Owner_occupied",
  "Renter-occupied" : "Renter_occupied",
  "Median (dollars)" : "Median",
  "Median household income (dollars)" : "Median_household_income",
  "Mean household income (dollars)" : "Mean_household_income",
  "All families" : "All_families",
  "All people" : "All_people",
  "Percent high school graduate or higher" : "high_school_graduate_higher",
  "Percent bachelor's degree or higher" : "bachelor_degree_higher"
};

requestPollAPI();

function requestPollAPI(){
  var req = new XMLHttpRequest();   
  req.onreadystatechange = function() {
	  if (req.readyState === XMLHttpRequest.DONE) {
	    if (req.status === 200) { 
		    var resp = JSON.parse(req.response);
		    console.log('poll client ',resp); 
        display(resp); 
	    } else {
    		console.log("Problem requesting data from server");
    		console.log("Response code ",req.status);
	    }
	  }
  }

  var reqURL = "http://45.55.29.158:8694/query?api";
  req.open('GET', reqURL, true);  
  req.send(null); 

}



function changeFunc() {
    var selected = document.getElementById("selectBox");
    var query = map[selected.options[selected.selectedIndex].text];
    var req = new XMLHttpRequest();
    
    req.onreadystatechange = function() {
  	  if (req.readyState === XMLHttpRequest.DONE) {
  	    if (req.status === 200) { 
  		    var resp = JSON.parse(req.response); 
  		    console.log(resp);  
          color(resp,query);
  	    } else {
      		console.log("Problem requesting data from server");
      		console.log("Response code ",req.status);
  	    }
  	  }
    }

    var reqURL = "http://45.55.29.158:8694/query?"+query;
    req.open('GET', reqURL, true);  
    req.send(null); 
}


function color(resp,query) {
   d3.selectAll('.delegateBox').html("");
   var divs = d3.select("div#blocks").selectAll("div.delegateBox")[0]; //get the blocks
   d3.select('div#legend')[0][0].style.background = 'linear-gradient(rgb(0,0,255), rgb(187,187,187))';
   var wide = d3.selectAll('.wide')[0];
   for(var i=0;i<158;i++){
    wide[i].style.backgroundColor = '#bbbbbb' ;
   }
  //set an array to store the votes' rates
   var max=resp[0][query],min=resp[0][query];
    var temp = [];
    for(var i=0;i<divs.length;i++){ 
      var num = resp[i][query];
      temp.push(resp[i][query]);
      if(num >= max) max = num;
      else if(num <= min) min=num; 
    } //set the min,max rates and store 53 districts' rates in rates[];
    console.log(temp);
    document.getElementById('max').textContent = Math.round(max*100)/100;
    document.getElementById('min').textContent = Math.round(min*100)/100;
  
    for(var i=0;i<divs.length;i++){
      d3.selectAll(".dist"+(i+1))[0][1].style.fill=gradient(normalize(resp[i][query],max,min)); //color map
      divs[i].style.backgroundColor=gradient(normalize(resp[i][query],max,min)); //color block
    }  //color the map and district*/
}

//assign each states a color based on the rates.
function gradient(k) { 

  var green=[0,0,255];
  var gray=[187,187,187];
  var color="rgb(";
  
  for(var i=0;i<3;i++){
    color+= parseInt(k*(green[i]-gray[i]) + gray[i])+","; 
  }
  
  color=color.substring(0,color.length-1);
  color=color+")";
  return color;
}

function normalize(r,maxRatio,minRatio){ 
  return (r - minRatio)/(maxRatio - minRatio);
}


function display(resp){
  var left= document.getElementById("leftBox");
  var right= document.getElementById("rightBox");
  for(var i =0;i<resp.length;i++){
    var text = resp[i].name+" "+resp[i].date;
    createP(text,left)
    
    var responses = resp[i].data.responses;
    var hill=0, bern=0;
    
    for(var j=0;j<responses.length;j++){
      if(responses[j].first_name == "Hillary"){
        hill = responses[j].value;
      }
      if(responses[j].first_name == "Bernie"){
        bern = responses[j].value;
      }
    }
    var rate = "Hillary:"+hill+" Bernie:"+bern;
    createP(rate,right)
  }
  
    createP("Model Predicts Vote",left);
    createP("Model Predicts Delegates",left);
}


function createP(text,parent){
  var p=document.createElement('p');
  p.textContent = text;
  p.style.margin=0;
  p.style.marginLeft="10px";
  p.style.textAlign='left';
  parent.appendChild(p);
}