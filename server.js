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
      SourceSoapURL = body.soap_instance_url;
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
      DestinationSoapURL = body.soap_instance_url;
      //console.log("body : "+ JSON.stringify(body)); 
    });
  
  




    //List of Data Extension API Callout
    let xmls='<?xml version="1.0" encoding="UTF-8"?>\
                <s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope" xmlns:a="http://schemas.xmlsoap.org/ws/2004/08/addressing" xmlns:u="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">\
                    <s:Header>\
                        <a:Action s:mustUnderstand="1">Retrieve</a:Action>\
                        <a:MessageID>urn:uuid:7e0cca04-57bd-4481-864c-6ea8039d2ea0</a:MessageID>\
                        <a:ReplyTo>\
                            <a:Address>http://schemas.xmlsoap.org/ws/2004/08/addressing/role/anonymous</a:Address>\
                        </a:ReplyTo>\
                        <a:To s:mustUnderstand="1">https://mc6vgk-sxj9p08pqwxqz9hw9-4my.soap.marketingcloudapis.com/Service.asmx</a:To>\
                        <fueloauth xmlns="http://exacttarget.com">' + 'eyJhbGciOiJIUzI1NiIsImtpZCI6IjEiLCJ2ZXIiOiIxIiwidHlwIjoiSldUIn0.eyJhY2Nlc3NfdG9rZW4iOiJZbU5aRVJJSW9MQkdRZ1hvNDdDTXJnRnciLCJjbGllbnRfaWQiOiI0ZXBobjBxd2pldWF5b3N1YjA3cDNibmkiLCJlaWQiOjExMDAwNTY5MCwic3RhY2tfa2V5IjoiUzExIiwicGxhdGZvcm1fdmVyc2lvbiI6MiwiY2xpZW50X3R5cGUiOiJTZXJ2ZXJUb1NlcnZlciJ9.WMjHRbLGutiWniUrlBOWuf0fWsD35KDuhWksE_y4KH0.qCIFHTo60jL9eSu_eS_SVLBrwC8W52y-vxOSyB_B6SGvhVIyM7ybOluvYHEQGlExHwrOYwgxPcG2R14nqAkSPI8KEPPdnyH0z4bTZ4b7raXBYKgV8oYYfUiQfOxddJFSnCTiBgldVIDo2pSBXtU7upm4ZUdg_UkI8ZKqTCI0llr1gcpiGaa' + '</fueloauth>\
                    </s:Header>\
                    <s:Body xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">\
                        <RetrieveRequestMsg xmlns="http://exacttarget.com/wsdl/partnerAPI">\
                            <RetrieveRequest>\
                                <ObjectType>DataExtension</ObjectType>\
                                <Properties>CustomerKey</Properties>\
                                <Properties>Name</Properties>\
                                <Properties>DataExtension.ObjectID</Properties>\
                                <Properties>IsSendable</Properties>\
                                <Properties>SendableSubscriberField.Name</Properties>\
                                <Properties>SendableDataExtensionField.Name</Properties>\
                                <Properties>CategoryID</Properties>\
                                <Filter xsi:type="SimpleFilterPart">\
                                    <Property>Name</Property>\
                                    <SimpleOperator>equals</SimpleOperator>\
                                    <Value>Filter Activity DE</Value>\
                                </Filter>\
                            </RetrieveRequest>\
                      </RetrieveRequestMsg>\
                  </s:Body>\
                </s:Envelope>';
                console.log('SourceAccessToken : ' + SourceAccessToken);
    request.post({
      url: SourceSoapURL + 'Service.asmx',
      body: xmls
    }, 
    function(error, response, body){
      console.log("JSON body : "+ JSON.stringify(body));
      console.log("body : "+ body); 
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



    
    app.post('/DEListShow', (req, res) => {
      console.log('DEListShow');
    })
  
  
  





  
  


});
app.listen(port, () => {
    console.log('Example app is listening on port http://localhost:${port}');
});