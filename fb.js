var request = require('request');
var OAuth2 = require('oauth2').OAuth2;
var oauth2 = new OAuth2("1746038399022111",
                        "e86ac7375a2cd6d824ce763e5a838b64",
                       "", "https://www.facebook.com/dialog/oauth",
                   "https://graph.facebook.com/oauth/access_token",
                   null);
  
app.get('/get_fb_profile', function(req, res) {
 oauth2.get('https://graph.facebook.com/me', req.session.accessToken, function(err, data ,response) {
  if (err) {
   console.error(err);
   res.send(err);
  } else {
   var profile = JSON.parse(data);
   console.log(profile);
   var profile_img_url = "https://graph.facebook.com/"+profile.id+"/picture";
  }
 });
});