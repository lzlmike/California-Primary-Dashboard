var districts = [6, 8, 6, 6, 7, 6, 6, 5, 6, 5, 7, 9, 8, 7, 7, 5, 6, 8, 6, 6, 4, 5, 5, 6, 5, 6, 6, 7, 5, 7, 5, 6, 7, 5, 5, 5, 7, 6, 6, 5, 5, 5, 6, 6, 6, 5, 6, 6, 6, 5, 5, 6, 7];


var divList = d3.select("div#blocks").selectAll("div.delegateBox");

// bind the data to the list of divs
var divs=divList.data(districts); 

// make a div corresponding to every data item
divs.enter().append("div");
// edit HTML attributes and CSS style parameters
divs.attr("class", function(d,i) {return "delegateBox dist"+(i+1)});
divs.attr("title",function(d,i) {return i+1;});
divs.style("height", function(d) {return (d*5)+"px"});
//divs.style("width", function(d) {return (d*5)+"px"});
divs.on("mouseover", function(d,i) { highlight("dist"+(i+1)); highlight("inside"+(i+1)); });
divs.on("mouseout", function(d,i) { highlight(null); });

function highlight(type) {
  if (type == null) {
      els = d3.selectAll(".delegateBox,.land,.insidebox");
      els.classed("active", false);
      } else {
      els = d3.selectAll("."+type);
      els.classed("active", true);
      }
}

/* CAmaps code starts here */


var width = 400,
    height = 700;

var projection = d3.geo.albersUsa()
    .scale(3000)
    .translate([1100,400]);

var path = d3.geo.path()
    .projection(projection);

var svg = d3.select("#map").append("svg")
    .attr("width", width)
    .attr("height", height);


queue()
    .defer(d3.json, "us.json")
    .defer(d3.json, "us-congress-113.json")
    .await(ready);

function ready(error, us, congress) {
  if (error) throw error;

  var districts = congress.objects.districts;

  var CA = [];
  for (var i=0; i<districts.geometries.length; i++) {
      var id = districts.geometries[i].id;
      if ((id >= 600) && (id < 700)) { // California!
	  districts.geometries[i].id = id - 600; 
	  CA.push(districts.geometries[i]);
      }
  }
  
  // overwrite the whole US map with just California
  districts.geometries = CA;

  districts.bbox = [-180, 0, 0, 70];


  svg.append("defs").append("path")
      .attr("id", "land")
      .datum(topojson.feature(us, us.objects.land))
      .attr("d", path);

  svg.append("clipPath")
      .attr("id", "clip-land")
    .append("use")
      .attr("xlink:href", "#land");

  // The districts
  var district = svg.append("g")
      .attr("clip-path", "url(#clip-land)")
//      .attr("class", "land")
    .selectAll("path")  // the group contains many paths
      .data(topojson.feature(congress, districts).features)
    .enter().append("path")
      .attr("d", path);

// new stuff to replace hover
    district
      .attr("class",function(d) {var i = d.id;  return "land dist"+i;})
      .on("mouseover", function(d) {var i = d.id; highlight("dist"+i); highlight("inside"+i);})
      .on("mouseout", function() { highlight(null); });


  // the tool-tip pop-up
  district.append("title")
      .text(function(d) { return d.id; });

  // the white borders between districts
  svg.append("path")
      .attr("class", "border border--district")
      .datum(topojson.mesh(congress, congress.objects.districts, function(a, b) { return a !== b && (a.id / 1000 | 0) === (b.id / 1000 | 0); }))
      .attr("d", path);

}

