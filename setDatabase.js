//Databasse set up
var sqlite3 = require("sqlite3");
var fs = require("fs");
var parse =  require("csv-parse");
var poll = fs.readFileSync("fieldPoll.csv");

var db = new sqlite3.Database("polls.db");

parse(poll, {comment:'#',relax_column_count:true}, 
  function(err,array){
      db.serialize(function(){  
        var create = "CREATE TABLE IF NOT EXISTS Polls (population TEXT, hillary INT, bernie INT,undecided INT)";   
        db.run(create,function(error){
          console.log(error);
        });    
        var insert = "INSERT INTO Polls VALUES";
        for(var i = 0; i< array.length; i++){
          if(array[i][1]!=''){
            var temp = array[i][0].split(' ');
            var pop = temp.slice(1,temp.length+1).join(" ");
            insert+="\n('"+pop+"',"+array[i][1]+","+array[i][2]+","+array[i][3]+"),";
          }
        }
        insert= insert.substring(0,insert.length-1);
        db.run(insert,function(error){
          console.log(error);
        }); 
      });
  }
);


var db2 = new sqlite3.Database("census.db");
var census = fs.readFileSync("CaliforniaCensus.csv");
parse(census, {comment:'#',relax_column_count:true}, 
  function(err,array){
      db2.serialize(function(){  
        var create = "CREATE TABLE IF NOT EXISTS Census (district INT, population INT, Median_age REAL, \
          White REAL, Black_Africa_American REAL, American_Indian_Alaska_Native REAL, Asian REAL,  \
          Native_Hawaiian_Pacific_Islander REAL, Hispanic_Latino REAL, Born_United_States REAL, Foreign_born REAL,\
          Civilian_veterans REAL, Percent_Unemployed REAL, Owner_occupied REAL, Renter_occupied REAL, Median INT,\
          Median_household_income INT, Mean_household_income INT, All_families REAL, All_people REAL, \
          high_school_graduate_higher REAL, bachelor_degree_higher REAL)";   
        console.log(create);
        db2.run(create,function(error){
          console.log(error);
        });    
        var insert = "INSERT INTO Census VALUES";      
        for(var i = 0; i< 53; i++){
           var total = array[3+271*i][1].replace(/,/g,'');
           var housetotal = parseInt(array[155+271*i][1].replace(/,/g,''))+parseInt(array[156+271*i][1].replace(/,/g,''));
           insert+="\n("+i+","+total+","+(array[19+271*i][1].replace(/,/g,''))+","+array[25+271*i][1].replace(/,/g,'')/total+","
           +array[26+271*i][1].replace(/,/g,'')/total+","+array[27+271*i][1].replace(/,/g,'')/total+","+
           array[28+271*i][1].replace(/,/g,'')/total+","+array[29+271*i][1].replace(/,/g,'')/total+","+
           array[34+271*i][1].replace(/,/g,'')/total+","+array[43+271*i][1].replace(/,/g,'')/total+","+
           array[47+271*i][1].replace(/,/g,'')/total+","+array[79+271*i][1].replace(/,/g,'')/total+","+
           array[108+271*i][1].replace('%','')/100+","+array[155+271*i][1].replace(/,/g,'')/housetotal+","+
           array[156+271*i][1].replace(/,/g,'')/housetotal+","+array[177+271*i][1].replace('+','').replace(/,/g,'').replace('$','')+","+
           array[223+271*i][1].replace(/,/g,'').replace('$','')+","+array[224+271*i][1].replace(/,/g,'').replace('$','')+","+
           array[234+271*i][1].replace('%','')/100+","+array[243+271*i][1].replace('%','')/100+","+
           array[269+271*i][1].replace('%','')/100+","+array[270+271*i][1].replace('%','')/100+"),";
        }
    
        insert= insert.substring(0,insert.length-1);
        console.log(insert);
        db2.run(insert,function(error){
          console.log(error);
        });
      });
  }
);

