var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var mysql = require('mysql');
var cookieparser=require('cookie-parser');
var session=require('express-session');

var app = express();

var token = "EAAUAGjJDe3EBALBDdKSCw0mfcOs0OUfNXoOaVYW0PzrdUrV8iHSOF6oC4wtHkZAhkep1LsFLpCkVR5VqurQotp6DTYyPdTq3SJ0W28kHmK9uXMB7qymZAvAnWf3HlHBZCwfNKZAZADNzyS7kZB0pcZAO5ZAoTVxsZAuHUVBlmGYp1RAZDZD";

var cid=0;
app.set('cid',0)
app.set('port', (process.env.PORT || 1000))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(cookieparser())
app.use(session({secret:'fbtoken'}));

app.get('/', function (req, res) {
  res.send('Facebook Bot')
});

var con = mysql.createConnection({
  host: "us-cdbr-iron-east-03.cleardb.net",
  user: "b6b44c614c6637",
  password: "980a1407",
  database: "heroku_e98968247b42df2"
});

/*
 * Use your own validation token. Check that the token used in the Webhook 
 * setup is the same token used here.
 *
 */
app.get('/webhook', function (req, res) {
  if (req.query['hub.mode'] === 'subscribe' && req.query['hub.verify_token'] === 'webhooktoken') {
    console.log("Validating webhook");
    res.status(200).send(req.query['hub.challenge']);
  } else {
    console.error("Failed validation. Make sure the validation tokens match.");
    res.sendStatus(403);
  }
});

/*
 * All callbacks for Messenger are POST-ed. They will be sent to the same webhook.
 *
 */
var sess;
app.post('/webhook', function (req, res) {
  var data = req.body;
  if (data.object == 'page') {
    data.entry.forEach(function (pageEntry) {
      var pageID = pageEntry.id;
      var timeOfEvent = pageEntry.time;          
      pageEntry.messaging.forEach(function (event) {
        if (event.message && event.message.text) {
        	sess=req.session;
          receivedMessage(event,sess);
        }
      });
    });
    res.sendStatus(200);
  }
});

con.connect(function(err){if (err) throw err;});
function receivedMessage(event,sess) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfMessage = event.timestamp;
  var message = event.message.text;
  var messageText ="How may i help you?";
  /*
 con.query("SELECT * FROM cruise_master where cname like '%"+message+"%'", function (err, result, fields) {
    if (err) throw err;
   if(result.length  > 0){
           messageText="Welcome to "+message+" Cruise.Please feel free to ask any question.";
            cid=result[0].cid;

            var messageData = {
          recipient: { id: senderID },
          message: { text: messageText }
        };

        //callSendAPI(messageData);
   }
   else{
     var sqlqry;
     if(cid != 0){
          sqlqry="SELECT * FROM faq_master where question like '%"+message+"%' and cid=0";
     }
     else{
        sqlqry="SELECT * FROM faq_master where question like '%"+message+"%' and cid='"+cid+"'";
     }
        con.query(sqlqry, function (err, result, fields) {
          if (err) throw err;
          messageText =result[0].answer;
          console.log(result[0].answer); 
            var messageData = {
          recipient: { id: senderID },
          message: { text: messageText }
        };

        //callSendAPI(messageData);

      });

   
   }
     callSendAPI(messageData);
  
});  
 */
  con.query("select * from cruise_master where cname like '%"+message+"%'",function(err,result,fields){
  	
  	if(result.length > 0){
		//
		cid=result[0].cid;
		app.set('cid', cid);
		sess.cid('cid',cid);
		messageText="welcome to "+message+" Cruise . Please ask que";
		console.log(messageText);
       var messageData = {
          recipient: { id: senderID },
          message: { text: messageText }
        };
      callSendAPI(messageData);
	}
	else{
		if(sess.cid!=0){
			con.query("SELECT * FROM faq_master where question like '%"+message+"%' and cid='"+cid+"'", function (err, result, fields) {
		    if (err) throw err;
		    if(result.length > 0){
				messageText=result[0].answer;
			}
			else{
				messageText="Sorry, i am not able to get you";
			}
		    
		    console.log(messageText);
        
         var messageData = {
          recipient: { id: senderID },
          message: { text: messageText }
        };
      callSendAPI(messageData);
        
		  });
			
			
			
		}else{
			con.query("SELECT * FROM faq_master where question like '%"+message+"%' and cid=0", function (err, result, fields) {
		    if (err) throw err;
		   if(result.length > 0){
				messageText=result[0].answer;
			}
			else{
				messageText="Sorry, i am not able to get you";
			}
		    console.log(messageText);
         var messageData = {
          recipient: { id: senderID },
          message: { text: messageText }
        };
      callSendAPI(messageData);
        
		  });
		}
		//
				
				
		
		
	}
  	
  });
  
  
  /*if(message=="hi"){
  	messageText ="I'm Siva, How can I help you ?";
  }
  else{
  	messageText ="Sorry , please say again?";
  }*/
   
/*
  var messageData = {
    recipient: { id: senderID },
    message: { text: messageText }
  };

  callSendAPI(messageData);*/
  
}

/*
 * Call the Send API. The message data goes in the body. If successful, we'll 
 * get the message id in a response 
 *
 */
function callSendAPI(messageData) {
  request({
    uri: 'https://graph.facebook.com/v2.6/me/messages',
    qs: { access_token: token },
    method: 'POST',
    json: messageData

  }, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var recipientId = body.recipient_id;
      var messageId = body.message_id;
      console.log("Successfully sent generic message with id %s to recipient %s", messageId, recipientId);
    } else {
      console.error("Unable to send message.");
      console.error(response);
      console.error(error);
    }
  });
}

app.listen(app.get('port'), function () {
  console.log('running on port', app.get('port'))
})