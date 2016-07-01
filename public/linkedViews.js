var districts = [6, 8, 6, 6, 7, 6, 6, 5, 6, 5, 7, 9, 8, 7, 7, 5, 6, 8, 6, 6, 4, 5, 5, 6, 5, 6, 6, 7, 5, 7, 5, 6, 7, 5, 5, 5, 7, 6, 6, 5, 5, 5, 6, 6, 6, 5, 6, 6, 6, 5, 5, 6, 7];
var click_count= 0; 

function buttonAction() {
    var req = new XMLHttpRequest();
    click_count++;
    req.onreadystatechange = function() {
  	  if (req.readyState === XMLHttpRequest.DONE) {
  	    if (req.status === 200) { 
  		    var resp = JSON.parse(req.response); 
          console.log(resp);
          visualize(resp);
  	    } else {
      		console.log("Problem requesting data from server");
      		console.log("Response code ",req.status);
  	    }
  	  }
    }

    var reqURL = "http://45.55.29.158:8694/query?model";
    req.open('GET', reqURL, true);  
    req.send(null); 
}

function visualize(res){
  var hill=0,bernie=0,hDele=0,bDele=0;
  var rate = new Array(53);
  var hillBar = new Array(53);
  for(var i=0;i<res.length;i++){
    var resultNow = res[i];
    rate[i] = resultNow.hillV/(resultNow.hillV+resultNow.bernieV);
    console.log("District "+(i+1)+" Hillary "+Math.round(rate[i]*100)+" Bernie "+(100-Math.round(rate[i]*100)));
    var delegateH = Math.round(districts[i]*resultNow.hillV/(resultNow.hillV+resultNow.bernieV));
    var delegateB = districts[i]-delegateH;
    hillBar[i]=delegateH;
    hill+=resultNow.hillV;
    bernie+=resultNow.bernieV;
    hDele+=delegateH;
    bDele+=delegateB;
  }
  var hill_rate = Math.round(hill/(hill+bernie)*100);
  var stateWideH=Math.round(158*hill/(hill+bernie));
  var stateWideB = 158-stateWideH;
  colorBar(hillBar);
  colorWideDele(stateWideH,stateWideB);
  colorMap(rate);
  if(click_count==1) addRate(hill_rate,hDele,bDele,stateWideH);
}

function colorBar(hillBar){
  d3.selectAll('.delegateBox').html("");
  for(var i=1;i<54;i++){
    var box = d3.select(".dist"+i);
    box[0][0].style.backgroundColor='red'; 
    box.append("div")
      .attr('class','insidebox inside'+i)
      .style('height', hillBar[i-1]*5+'px');
  }
}

function colorWideDele(h,b){
  for(var i=0;i<158;i++){
    var id="'wide "+i+"'";
    var block=document.getElementById(id);
    if(i<b) block.style.backgroundColor="blue";
    else block.style.backgroundColor="red";
  }
}

//color the map
function colorMap(resp) {
    var divs = d3.select("div#blocks").selectAll("div.delegateBox")[0]; 
    var max=0,min=1;
    d3.select('div#legend')[0][0].style.background = 'linear-gradient(rgb(0,0,255), rgb(255,0,0))';

    for(var i=0;i<divs.length;i++){
      if(resp[i]>=max) max=resp[i];
      else if(resp[i]<=min) min=resp[i];
    }
    document.getElementById('max').textContent = Math.round(max*100)/100;
    document.getElementById('min').textContent = Math.round(min*100)/100;
     
    for(var i=0;i<divs.length;i++){
      d3.selectAll(".dist"+(i+1))[0][1].style.fill=gradients(normalize(resp[i],max,min)); //color map
     // divs[i].style.backgroundColor=gradients(normalize(resp[i],max,min)); //color block
    }  //color the map and district
}

//assign each states a color based on the rates.
function gradients(k) { 
  var blue=[0,0,255];
  var red=[255,0,0];
  var color="rgb(";
  
  for(var i=0;i<3;i++){
    color+= parseInt(k*(blue[i]-red[i]) + red[i])+","; 
  }
  
  color=color.substring(0,color.length-1);
  color=color+")";
  return color;
}

function normalize(r,maxRatio,minRatio){ 
  return (r - minRatio)/(maxRatio - minRatio);
}

function addRate(hill,hDele,bDele,stateWideH){
  var right= document.getElementById("rightBox");
  var rate = "Hillary:"+hill+" Bernie:"+(100-hill); 
  createP(rate,right);
  var dele = "Hillary:"+(hDele+stateWideH)+" Bernie:"+(bDele+158-stateWideH); 
  createP(dele,right);
}

function createP(text,parent){
  var p=document.createElement('p');
  p.textContent = text;
  p.style.margin=0;
  p.style.marginLeft="10px";
  p.style.textAlign='left';  
  parent.appendChild(p);
}
