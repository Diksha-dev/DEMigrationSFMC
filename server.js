const express = require("express");
const app = express();
const path = require('path');
var http = require('http');
const port = process.env.PORT || 3000
var request = require('request');
const { stringify } = require("querystring");

app.get("*", (req,res) => {
    const FirstPage = path.join(__dirname, 'public', 'index.html');
    res.sendFile(FirstPage);
});

app.use(express.urlencoded({
    extended: true
  }))
  

  
  var SourceAccessToken = '';
  var SourceRestURL = '';
  var DestinationAccessToken = '';
  var DestinationRestURL = ''
  
  app.post('/Authenticate', (req, res) => {
    var SourceClientID = req.body.SourceClientID;
    var SourceClientSecret = req.body.SourceClientSecret;
    var SourceAuthBaseURI = req.body.SourceAuthBaseURI;
    var SourceMID = req.body.SourceMID;
  
    var DestinationClientID = req.body.DestinationClientID;
    var DestinationClientSecret = req.body.DestinationClientSecret;
    var DestinationAuthBaseURI = req.body.DestinationAuthBaseURI;
    var DestinationMID = req.body.DestinationMID;
  
    
  
    request.post({
      headers: {'content-type' : 'application/json'},
      url: SourceAuthBaseURI + '/v2/token',
      body:{
            'client_id': SourceClientID, //pass Client ID
            'client_secret': SourceClientSecret, //pass Client Secret
            'grant_type': 'client_credentials',
            'account_id':SourceMID
      },
      json: true
    }, 
    function(error, response, body){
      SourceAccessToken = body.access_token;
      SourceRestURL = body.rest_instance_url;
      //console.log("body : "+ JSON.stringify(body)); 
    });
  
  
    request.post({
      headers: {'content-type' : 'application/json'},
      url: DestinationAuthBaseURI + '/v2/token',
      body:{
            'client_id': DestinationClientID, //pass Client ID
            'client_secret': DestinationClientSecret, //pass Client Secret
            'grant_type': 'client_credentials',
            'account_id':DestinationMID
      },
      json: true
    }, 
    function(error, response, body){
      DestinationAccessToken = body.access_token;
      DestinationRestURL = body.rest_instance_url;
      //console.log("body : "+ JSON.stringify(body)); 
    });
  
  



















    const SecondPage = path.join(__dirname, 'public', 'SecondPage.html');
    res.sendFile(SecondPage);
  
    app.get("*", (req,res) => {
      const SecondPage = path.join(__dirname, 'public', 'SecondPage.html');
      res.sendFile(SecondPage);
    });

    app.use(express.urlencoded({
      extended: true
    }))




    app.post('/stack1', (req, res) => {
      var test = req.body.test;
      console.log("test : " + test);
  
  
      request.post({
        headers: {
          'Authorization' : "Bearer " + SourceAccessToken,
          'content-type' : 'application/json'
        },
        url: SourceRestURL + '/asset/v1/content/assets/query',
        body:{
          "query": {
            "property": "name",
            "simpleOperator": "like",
            "value": "Health Photo.jpg"
          },
          "fields": [
            "id",
            "name",
            "enterpriseId",
            "memberId",
            "thumbnail",
            "category",
            "content",
            "data",
            "fileProperties"
          ]
        },
        json: true
      }, 
      function(error, response, body){
        console.log("JSON.stringify(body)" + JSON.stringify(body));
        
        console.log("JSON.stringify(response)" + JSON.stringify(response));
  
        console.log("JSON.stringify(error)" + JSON.stringify(error));
      });
  
  
  
  
  
  
  
  
  })
  
  
  
  
  
  });
  
  
  
  
  app.listen(port, () => {
     console.log('Example app is listening on port http://localhost:${port}');
  });