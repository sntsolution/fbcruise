var mysql = require('mysql');
var prompt = require('prompt');
var cid=0;
var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "demo"
});
prompt.start();
var messageText="";
prompt.get(['message'], function (err, res) {
    // 
    // Log the results. 
    // 
con.connect(function(err) {
  if (err) throw err;
  
  con.query("select * from cruise_master where cname like '%"+res.message+"%'",function(err,result,fields){
  	
  	if(result.length > 0){
		//
		cid=result[0].cid;
		
		messageText="welcome to "+res.message+" Cruise . Please ask que";
		console.log(messageText);
	}
	else{
		if(cid!=0){
			con.query("SELECT * FROM faq_master where question like '%"+res.message+"%' and cid='"+cid+"'", function (err, result, fields) {
		    if (err) throw err;
		    if(result.length > 0){
				messageText=result[0].answer;
			}
			else{
				messageText="Sorry, i am not able to get you";
			}
		    
		    console.log(messageText);
		  });
			
			
			
		}else{
			con.query("SELECT * FROM faq_master where question like '%"+res.message+"%' and cid=0", function (err, result, fields) {
		    if (err) throw err;
		   if(result.length > 0){
				messageText=result[0].answer;
			}
			else{
				messageText="Sorry, i am not able to get you";
			}
		    console.log(messageText);
		  });
		}
		//
				
				
		
		
	}
  	
  });
});
});

