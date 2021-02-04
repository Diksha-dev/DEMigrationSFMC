const express = require("express");
const app = express();
const path = require('path');
var http = require('http');
const port = process.env.PORT || 3000
var request = require('request');
const { stringify } = require("querystring");
let xmlParser = require('xml2json');

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
var SourceListDEResult;
var SourceDEFieldsResult;

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

  var selectedDEList;


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
















  function getSourceListOfDE(){
    authTokenForBothSFDC();
    var ListDEOption = {
      'method': 'POST',
      'url': SourceSoapURL + 'Service.asmx',
      'headers': {
        'Content-Type': 'text/xml',
        'SoapAction': 'Retrieve',
        'Authorization': 'Bearer ' + SourceAccessToken
      },
      body: '<?xml version="1.0" encoding="UTF-8"?>\r\n<s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope" xmlns:a="http://schemas.xmlsoap.org/ws/2004/08/addressing" xmlns:u="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">\r\n    <s:Header>\r\n        <a:Action s:mustUnderstand="1">Retrieve</a:Action>\r\n        <a:MessageID>urn:uuid:7e0cca04-57bd-4481-864c-6ea8039d2ea0</a:MessageID>\r\n        <a:ReplyTo>\r\n            <a:Address>http://schemas.xmlsoap.org/ws/2004/08/addressing/role/anonymous</a:Address>\r\n        </a:ReplyTo>\r\n        <a:To s:mustUnderstand="1">https://mc6vgk-sxj9p08pqwxqz9hw9-4my.soap.marketingcloudapis.com/Service.asmx</a:To>\r\n        <fueloauth xmlns="http://exacttarget.com">'+ SourceAccessToken +'</fueloauth>\r\n    </s:Header>\r\n    <s:Body xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">\r\n        <RetrieveRequestMsg xmlns="http://exacttarget.com/wsdl/partnerAPI">\r\n            <RetrieveRequest>\r\n                <ObjectType>DataExtension</ObjectType>\r\n                <Properties>CustomerKey</Properties>\r\n                <Properties>Name</Properties>\r\n                <Properties>DataExtension.ObjectID</Properties>\r\n                <Properties>IsSendable</Properties>\r\n          <Properties>Description</Properties>\r\n                \r\n        \r\n                \r\n        \r\n             \r\n            </RetrieveRequest>\r\n      </RetrieveRequestMsg>\r\n   </s:Body>\r\n</s:Envelope>'

    };
    request(ListDEOption, function (error, response) {
      if (error) throw new Error(error);
      SourceListDEResult = response.body;
      SourceListDEResult = SourceListDEResult.replace(/:/g, "");
      SourceListDEResult = xmlParser.toJson(SourceListDEResult);
      SourceListDEResult = JSON.parse(SourceListDEResult);
      SourceListDEResult = SourceListDEResult.soapEnvelope.soapBody.RetrieveResponseMsg.Results;

      /*console.log('Parsed DE List :'+JSON.stringify(SourceListDEResult));
      for (var key in SourceListDEResult) {
        console.log('key : ' + SourceListDEResult[key].Name);
        console.log('key : ' + SourceListDEResult[key].CustomerKey);
        console.log('key : ' + SourceListDEResult[key].IsSendable);
        console.log('key : ' + SourceListDEResult[key].Description);
        console.log('Next');
      }*/

    });
    return JSON.stringify(SourceListDEResult);
  }



  async function getSourceDEFields(){
    await authTokenForBothSFDC();
    var DEFieldOption = {
      'method': 'POST',
      'url': SourceSoapURL + 'Service.asmx',
      'headers': {
        'Content-Type': 'text/xml',
        'SoapAction': 'Retrieve',
        'Authorization': 'Bearer ' + SourceAccessToken
      },
      body: '<?xml version="1.0" encoding="UTF-8"?>\r\n<s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope" xmlns:a="http://schemas.xmlsoap.org/ws/2004/08/addressing" xmlns:u="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">\r\n    <s:Header>\r\n        <a:Action s:mustUnderstand="1">Retrieve</a:Action>\r\n        <a:MessageID>urn:uuid:7e0cca04-57bd-4481-864c-6ea8039d2ea0</a:MessageID>\r\n        <a:ReplyTo>\r\n            <a:Address>http://schemas.xmlsoap.org/ws/2004/08/addressing/role/anonymous</a:Address>\r\n        </a:ReplyTo>\r\n        <a:To s:mustUnderstand="1">https://mc6vgk-sxj9p08pqwxqz9hw9-4my.soap.marketingcloudapis.com/Service.asmx</a:To>\r\n        <fueloauth xmlns="http://exacttarget.com">' + SourceAccessToken + '</fueloauth>\r\n    </s:Header>\r\n    <s:Body xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">\r\n        <RetrieveRequestMsg xmlns="http://exacttarget.com/wsdl/partnerAPI">\r\n            <RetrieveRequest>\r\n                <ObjectType>DataExtensionField</ObjectType>\r\n                <Properties>Client.ID</Properties>\r\n                <Properties>CreatedDate</Properties>\r\n                <Properties>CustomerKey</Properties>\r\n                <Properties>DataExtension.CustomerKey</Properties>\r\n                <Properties>DefaultValue</Properties>\r\n                <Properties>FieldType</Properties>\r\n                <Properties>IsPrimaryKey</Properties>\r\n                <Properties>IsRequired</Properties>\r\n                <Properties>MaxLength</Properties>\r\n                <Properties>ModifiedDate</Properties>\r\n                <Properties>Name</Properties>\r\n                <Properties>ObjectID</Properties>\r\n                <Properties>Ordinal</Properties>\r\n                <Properties>Scale</Properties>\r\n\r\n                 <Filter xsi:type="SimpleFilterPart">\r\n                    <Property>DataExtension.CustomerKey</Property>\r\n                    <SimpleOperator>equals</SimpleOperator>\r\n                    <Value>221ACA75-1A13-432E-9408-05F80B5BE733</Value>\r\n                </Filter>\r\n\r\n               <QueryAllAccounts>true</QueryAllAccounts>\r\n                <Retrieves />\r\n                <Options>\r\n                    <SaveOptions />\r\n                    <IncludeObjects>true</IncludeObjects>\r\n                </Options>\r\n            </RetrieveRequest>\r\n      </RetrieveRequestMsg>\r\n   </s:Body>\r\n</s:Envelope>'
    
    };
    request(DEFieldOption, function (error, response) {
      if (error) throw new Error(error);

      SourceDEFieldsResult = response.body;
      SourceDEFieldsResult = SourceDEFieldsResult.replace(/:/g, "");
      SourceDEFieldsResult = xmlParser.toJson(SourceDEFieldsResult);
      SourceDEFieldsResult = JSON.parse(SourceDEFieldsResult);
      SourceDEFieldsResult = SourceDEFieldsResult.soapEnvelope.soapBody.RetrieveResponseMsg.Results;

      //console.log('SourceDEFieldsResult :' + JSON.stringify(SourceDEFieldsResult));
      var DEFieldMap={};
      for (var key in SourceDEFieldsResult) {
        //console.log('keyvalue  '+SourceDEFieldsResult[key].Name);
        //console.log('keyvalue  '+SourceDEFieldsResult[key].CustomerKey);
        //console.log('keyvalue  '+SourceDEFieldsResult[key].IsRequired);
        //console.log('keyvalue  '+SourceDEFieldsResult[key].IsPrimaryKey);
        //console.log('keyvalue  '+SourceDEFieldsResult[key].DataExtension.CustomerKey);
        //console.log('keyvalue  '+SourceDEFieldsResult[key].FieldType);
        //console.log('Next');
        if(DEFieldMap.has(SourceDEFieldsResult[key].DataExtension.CustomerKey)){
          DEFieldMap.set(SourceDEFieldsResult[key].DataExtension.CustomerKey, 
          {
            Name : SourceDEFieldsResult[key].Name ,
            isRequired : SourceDEFieldsResult[key].IsRequired ,
            isPrimaryKey : SourceDEFieldsResult[key].IsPrimaryKey ,
            fieldType : SourceDEFieldsResult[key].FieldType
          })
        }
        else{
          DEFieldMap[SourceDEFieldsResult[key].DataExtension.CustomerKey] = {
            Name : SourceDEFieldsResult[key].Name ,
            isRequired : SourceDEFieldsResult[key].IsRequired ,
            isPrimaryKey : SourceDEFieldsResult[key].IsPrimaryKey ,
            fieldType : SourceDEFieldsResult[key].FieldType
          };
        } 
      }
      console.log('DEFieldMap : '+ DEFieldMap);


      




      var DEListBody = '<?xml version="1.0" encoding="UTF-8"?>' +
                          '<s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope" xmlns:a="http://schemas.xmlsoap.org/ws/2004/08/addressing" xmlns:u="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">' +
                              '<s:Header>' +
                                  '<a:Action s:mustUnderstand="1">Retrieve</a:Action>' +
                                  '<a:MessageID>urn:uuid:7e0cca04-57bd-4481-864c-6ea8039d2ea0</a:MessageID>' +
                                  '<a:ReplyTo>' +
                                      '<a:Address>http://schemas.xmlsoap.org/ws/2004/08/addressing/role/anonymous</a:Address>' +
                                  '</a:ReplyTo>' +
                                  '<a:To s:mustUnderstand="1">https://mc6vgk-sxj9p08pqwxqz9hw9-4my.soap.marketingcloudapis.com/Service.asmx</a:To>' +
                                  '<fueloauth xmlns="http://exacttarget.com">'+ DestinationAccessToken +'</fueloauth>' +
                              '</s:Header>' +
                              '<s:Body xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">' +
                                  '<RetrieveRequestMsg xmlns="http://exacttarget.com/wsdl/partnerAPI">' +
                                      '<RetrieveRequest>' +
                                          '<ObjectType>DataExtensionField</ObjectType>' +
                                          '<Properties>Client.ID</Properties>' +
                                          '<Properties>CreatedDate</Properties>' +
                                          '<Properties>CustomerKey</Properties>' +
                                          '<Properties>DataExtension.CustomerKey</Properties>' +
                                          '<Properties>DefaultValue</Properties>' +
                                          '<Properties>FieldType</Properties>' +
                                          '<Properties>IsPrimaryKey</Properties>' +
                                          '<Properties>IsRequired</Properties>' +
                                          '<Properties>MaxLength</Properties>' +
                                          '<Properties>ModifiedDate</Properties>' +
                                          '<Properties>Name</Properties>' +
                                          '<Properties>ObjectID</Properties>' +
                                          '<Properties>Ordinal</Properties>' +
                                          '<Properties>Scale</Properties>' +
                                          '<Filter xsi:type="SimpleFilterPart">' +
                                              '<Property>DataExtension.CustomerKey</Property>' +
                                              '<SimpleOperator>equals</SimpleOperator>' +
                                              '<Value>221ACA75-1A13-432E-9408-05F80B5BE733</Value>' +
                                          '</Filter>' +
                                          '<QueryAllAccounts>true</QueryAllAccounts>' +
                                          '<Retrieves />' +
                                          '<Options>' +
                                              '<SaveOptions />' +
                                              '<IncludeObjects>true</IncludeObjects>' +
                                          '</Options>' +
                                      '</RetrieveRequest>' +
                                '</RetrieveRequestMsg>' +
                            '</s:Body>' +
                          '</s:Envelope>';



      var DEListForInsert = {
        'method': 'POST',
        'url': DestinationSoapURL + 'Service.asmx',
        'headers': {
          'Content-Type': 'text/xml',
          'SoapAction': 'Create',
          'Authorization': 'Bearer ' + DestinationAccessToken
        },
        body: DEListBody
      
      };
      request(DEListForInsert, function (error, response) {
        if (error) throw new Error(error);
        console.log(response.body);
      });










    });
  }














  app.post("/DEListShowAPI", async (req, res) => {

    if (req.body.reqForDEList = 'True') {

      SourceListDEResult = await getSourceListOfDE();
      //await getSourceDEFields();
    }


    var x = setInterval(function(){
      //console.log('sbse last : '+ SourceListDEResult);
      res.send(SourceListDEResult);
      if(SourceListDEResult){
        clearInterval(x);
      }
    }, 1000);
      
    


  });














  
  app.post("/SelectedDEList", async (req, res) => {
    
    if (req.body.reqForSelectedDEList) {
      selectedDEList = req.body.reqForSelectedDEList;
      console.log('reqForSelectedDEList : '+ selectedDEList);

      //SourceListDEResult = await getSourceListOfDE();
      getSourceDEFields();
    }
    res.send('reqForSelectedDEList');

/*
    var x = setInterval(function(){
      console.log('sbse last : '+ SourceListDEResult);
      res.send(SourceListDEResult);
      if(SourceListDEResult){
        clearInterval(x);
      }
    }, 1000);
    */
      
    


  });












});
app.listen(port, () => {
  console.log('Example app is listening on port http://localhost:${port}');
});