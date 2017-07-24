var mysql = require('mysql');
var prompt = require('prompt');
var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "demo"
});
prompt.start();
prompt.get(['message'], function (err, res) {
    // 
    // Log the results. 
    // 
con.connect(function(err) {
  if (err) throw err;
  con.query("SELECT * FROM faq_master where question like '%"+res.message+"%' and cid=0", function (err, result, fields) {
    if (err) throw err;
    console.log(result[0].answer);
  });
});
  });
