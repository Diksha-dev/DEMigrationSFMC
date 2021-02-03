const express = require("express");
const app = express();
const path = require('path');
var http = require('http');
const port = process.env.PORT || 3000
var request = require('request');
const { stringify } = require("querystring");

app.get("*", (req, res) => {
  const FirstPage = path.join(__dirname, 'public', 'index.html');
  res.sendFile(FirstPage);
});

app.use(express.urlencoded({
  extended: true
}))



var SourceAccessToken = '';
var SourceRestURL = '';
var SourceSoapURL = '';
var DestinationAccessToken = '';
var DestinationRestURL = '';
var DestinationSoapURL = '';

app.post('/Authenticate', (req, res) => {
  var SourceClientID = req.body.SourceClientID;
  var SourceClientSecret = req.body.SourceClientSecret;
  var SourceAuthBaseURI = req.body.SourceAuthBaseURI;
  var SourceMID = req.body.SourceMID;

  var DestinationClientID = req.body.DestinationClientID;
  var DestinationClientSecret = req.body.DestinationClientSecret;
  var DestinationAuthBaseURI = req.body.DestinationAuthBaseURI;
  var DestinationMID = req.body.DestinationMID;


  async function authTokenForBothSFDC(){

    await request.post({
      headers: { 'content-type': 'application/json' },
      url: SourceAuthBaseURI + '/v2/token',
      body: {
        'client_id': SourceClientID, //pass Client ID
        'client_secret': SourceClientSecret, //pass Client Secret
        'grant_type': 'client_credentials',
        'account_id': SourceMID
      },
      json: true
    },
      function (error, response, body) {
        SourceAccessToken = body.access_token;
        SourceRestURL = body.rest_instance_url;
        SourceSoapURL = body.soap_instance_url;
        //console.log("body : "+ JSON.stringify(body));
        console.log("source auth chala"); 
      });
  
  
    await request.post({
      headers: { 'content-type': 'application/json' },
      url: DestinationAuthBaseURI + '/v2/token',
      body: {
        'client_id': DestinationClientID, //pass Client ID
        'client_secret': DestinationClientSecret, //pass Client Secret
        'grant_type': 'client_credentials',
        'account_id': DestinationMID
      },
      json: true
    },
      function (error, response, body) {
        DestinationAccessToken = body.access_token;
        DestinationRestURL = body.rest_instance_url;
        DestinationSoapURL = body.soap_instance_url;
        //console.log("body : "+ JSON.stringify(body));
        console.log("destination auth chala"); 
      });
  }
  authTokenForBothSFDC();














  const SecondPage = path.join(__dirname, 'public', 'SecondPage.html');
  res.sendFile(SecondPage);

  app.get("*", (req, res) => {
    const SecondPage = path.join(__dirname, 'public', 'SecondPage.html');
    res.sendFile(SecondPage);
  });

  app.use(express.urlencoded({
    extended: true
  }))




  app.post("/DEListShowAPI", async (req, res) => {

    if (req.body.reqForDEList = 'True') {
      console.log('req.body : ' + JSON.stringify(req.body));

      console.log('auth se pehle ');
      await authTokenForBothSFDC();
      console.log('auth k baad ');

      var options = {
        'method': 'POST',
        'url': SourceSoapURL + 'Service.asmx',
        'headers': {
          'Content-Type': 'text/xml',
          'SoapAction': 'Retrieve',
          'Authorization': 'Bearer ' + SourceAccessToken
        },
        body: '<?xml version="1.0" encoding="UTF-8"?>\r\n<s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope" xmlns:a="http://schemas.xmlsoap.org/ws/2004/08/addressing" xmlns:u="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">\r\n    <s:Header>\r\n        <a:Action s:mustUnderstand="1">Retrieve</a:Action>\r\n        <a:MessageID>urn:uuid:7e0cca04-57bd-4481-864c-6ea8039d2ea0</a:MessageID>\r\n        <a:ReplyTo>\r\n            <a:Address>http://schemas.xmlsoap.org/ws/2004/08/addressing/role/anonymous</a:Address>\r\n        </a:ReplyTo>\r\n        <a:To s:mustUnderstand="1">https://mc6vgk-sxj9p08pqwxqz9hw9-4my.soap.marketingcloudapis.com/Service.asmx</a:To>\r\n        <fueloauth xmlns="http://exacttarget.com">'+ SourceAccessToken +'</fueloauth>\r\n    </s:Header>\r\n    <s:Body xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">\r\n        <RetrieveRequestMsg xmlns="http://exacttarget.com/wsdl/partnerAPI">\r\n            <RetrieveRequest>\r\n                <ObjectType>DataExtension</ObjectType>\r\n                <Properties>CustomerKey</Properties>\r\n                <Properties>Name</Properties>\r\n                <Properties>DataExtension.ObjectID</Properties>\r\n                <Properties>IsSendable</Properties>\r\n                <Properties>SendableSubscriberField.Name</Properties>\r\n                <Properties>SendableDataExtensionField.Name</Properties>\r\n                <Properties>CategoryID</Properties>\r\n                \r\n        \r\n                <Filter xsi:type="SimpleFilterPart">\r\n                    <Property>Name</Property>\r\n                    <SimpleOperator>equals</SimpleOperator>\r\n                    <Value>Filter Activity DE</Value>\r\n                </Filter>\r\n        \r\n             \r\n            </RetrieveRequest>\r\n      </RetrieveRequestMsg>\r\n   </s:Body>\r\n</s:Envelope>'

      };
      request(options, function (error, response) {
        if (error) throw new Error(error);
        console.log(response.body);
      });

















      
    }
    await res.send('body');
  });












});
app.listen(port, () => {
  console.log('Example app is listening on port http://localhost:${port}');
});