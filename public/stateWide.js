var body = document.body;
var heads = document.createElement("h1");
var text = document.createTextNode("State Wide Delegates");
heads.appendChild(text);
body.appendChild(heads);

var stateWide = document.createElement("div");
stateWide.className="stateWide";


body.appendChild(stateWide);
for(var i=0;i<158;i++){
  var block=document.createElement("div");
  block.className="wide";
  block.id="'wide "+i+"'";
  stateWide.appendChild(block);
}