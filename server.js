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
      console.log("body : "+ JSON.stringify(body)); 
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
      console.log("body : "+ JSON.stringify(body)); 
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





    var tds ="", i;
    for (i=1; i<=6; i++) {
      tds = tds + '<tr class="slds-hint-parent"> ' +
                    '<td class="slds-row-select"> ' + 
                      '<label class="slds-checkbox" for="select-row1"> ' +
                        '<input name="select-row1" type="checkbox" id="select-row1" /> ' +
                        '<span class="slds-checkbox--faux"></span> ' + 
                        '<span class="slds-form-element__label slds-assistive-text">select row1</span> ' + 
                      '</label> ' + 
                    '</td>' +
                    '<th data-label="name" role="row"><a href="#" class="slds-truncate">' + 'Acme' + '</a></th> ' +
                        '<td data-label="external-key"><a href="#" class="slds-truncate"> ' + 'Acme' + '</a></td> ' +
                        '<td data-label="description"> ' +
                            '<span class="slds-truncate">' + '4/14/2015' + '</span>' +
                        '</td>' +
                        '<td data-label="field-count">' +
                            '<span class="slds-truncate">' + 'Prospecting' + '</span>' +
                        '</td>' +
                        '<td data-label="record-count">' +
                            '<span class="slds-truncate">' + '20%' + '</span>' +
                        '</td>' + 
                        '<td data-label="sendable">' +
                            '<span class="slds-truncate">' + '$25k' + '</span>' +
                        '</td>' + 
                        '<td data-label="testable">' + 
                            '<span class="slds-truncate">' + 'ghc' + '</span>' +
                        '</td>' +
                    '</tr>';
    }
    document.getElementById("DEBody").innerHTML = tds;


    var tds = document.querySelectorAll('#DEBody tbody td'), i;
    for(i = 0; i < tds.length; ++i) {
      console.log("tds : "+ JSON.stringify(tds[i].innerHTML)); 
    }
    






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