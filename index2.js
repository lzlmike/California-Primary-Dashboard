var http  = require('http');
var url = require('url');
var statix = require('node-static');
var queries = require('./queries');

var staticFileServer = new statix.Server('./public',{cache: 0});


function handler (request,response) {

    var urlStr = request.url;
    var urlObj = url.parse(urlStr);  
    var pathname = urlObj.pathname; 
    var search = urlObj.search;    
 
    if ((search != undefined) && (pathname == "/query")) {
	      queries.queryServer(request,response,search);
    } else {
	      staticFileServer.serve(request,response);
    }
}

server = http.createServer(handler);
server.listen(8694);
