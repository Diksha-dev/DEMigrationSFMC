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
var DEFieldMap={};

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
      });
      console.log('auth chala');
  }
  authTokenForBothSFDC();
  
  var c = 0;
  var b = setInterval(function() {
    authTokenForBothSFDC();
    c = c + 1;
    if(c == 5) {
      clearInterval(b);
    }
  }, 1000000);














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
      body: '<?xml version="1.0" encoding="UTF-8"?>\r\n<s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope" xmlns:a="http://schemas.xmlsoap.org/ws/2004/08/addressing" xmlns:u="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">\r\n    <s:Header>\r\n        <a:Action s:mustUnderstand="1">Retrieve</a:Action>\r\n        <a:MessageID>urn:uuid:7e0cca04-57bd-4481-864c-6ea8039d2ea0</a:MessageID>\r\n        <a:ReplyTo>\r\n            <a:Address>http://schemas.xmlsoap.org/ws/2004/08/addressing/role/anonymous</a:Address>\r\n        </a:ReplyTo>\r\n        <a:To s:mustUnderstand="1">https://mc6vgk-sxj9p08pqwxqz9hw9-4my.soap.marketingcloudapis.com/Service.asmx</a:To>\r\n        <fueloauth xmlns="http://exacttarget.com">'+ SourceAccessToken +'</fueloauth>\r\n    </s:Header>\r\n    <s:Body xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">\r\n        <RetrieveRequestMsg xmlns="http://exacttarget.com/wsdl/partnerAPI">\r\n            <RetrieveRequest>\r\n                <ObjectType>DataExtension</ObjectType>\r\n                <Properties>CustomerKey</Properties>\r\n                <Properties>Name</Properties>\r\n                <Properties>DataExtension.ObjectID</Properties>\r\n                <Properties>IsSendable</Properties>\r\n          <Properties>IsTestable</Properties>\r\n             <Properties>SendableSubscriberField.Name</Properties>\r\n        <Properties>SendableDataExtensionField.Name</Properties>\r\n          <Properties>Description</Properties>\r\n                \r\n        \r\n                \r\n        \r\n             \r\n            </RetrieveRequest>\r\n      </RetrieveRequestMsg>\r\n   </s:Body>\r\n</s:Envelope>'
    };
    request(ListDEOption, function (error, response) {
      if (error) throw new Error(error);
      SourceListDEResult = response.body;
      SourceListDEResult = SourceListDEResult.replace(/:/g, "");
      SourceListDEResult = xmlParser.toJson(SourceListDEResult);
      SourceListDEResult = JSON.parse(SourceListDEResult);
      SourceListDEResult = SourceListDEResult.soapEnvelope.soapBody.RetrieveResponseMsg.Results;

      var tempDEList = [];
      for (var key in SourceListDEResult) {
        if(SourceListDEResult[key].Name != "ExpressionBuilderAttributes" && SourceListDEResult[key].Name != "_MobileAddress" && SourceListDEResult[key].Name != "_MobileSubscription" && SourceListDEResult[key].Name != "_PushAddress" && SourceListDEResult[key].Name != "_PushTag" && SourceListDEResult[key].Name != "_MobileLineAddressContact" && SourceListDEResult[key].Name != "_MobileLineAddress" && SourceListDEResult[key].Name != "_MobileLineProfile" && SourceListDEResult[key].Name != "_MobileLineProfileAttribute" && SourceListDEResult[key].Name != "_MobileLineSubscription" && SourceListDEResult[key].Name != "MobileLineOrphanContact") {
          tempDEList.push(SourceListDEResult[key]);
        }
      }
      SourceListDEResult = tempDEList;
      //console.log('Parsed DE List :'+JSON.stringify(SourceListDEResult));



      /*for (var key in SourceListDEResult) {
        console.log('key : ' + SourceListDEResult[key].Name);
        console.log('key : ' + SourceListDEResult[key].CustomerKey);
        console.log('key : ' + SourceListDEResult[key].IsSendable);
        console.log('key : ' + SourceListDEResult[key].IsTestable);
        console.log('key : ' + SourceListDEResult[key].Description);
        //console.log('key : ' + SourceListDEResult[key].SendableDataExtensionField.Name);
        //console.log('key : ' + SourceListDEResult[key].SendableSubscriberField.Name);
        console.log('Next');
      }*/
    });
    return SourceListDEResult;
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
      body: '<?xml version="1.0" encoding="UTF-8"?>\r\n<s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope" xmlns:a="http://schemas.xmlsoap.org/ws/2004/08/addressing" xmlns:u="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">\r\n    <s:Header>\r\n        <a:Action s:mustUnderstand="1">Retrieve</a:Action>\r\n        <a:MessageID>urn:uuid:7e0cca04-57bd-4481-864c-6ea8039d2ea0</a:MessageID>\r\n        <a:ReplyTo>\r\n            <a:Address>http://schemas.xmlsoap.org/ws/2004/08/addressing/role/anonymous</a:Address>\r\n        </a:ReplyTo>\r\n        <a:To s:mustUnderstand="1">https://mc6vgk-sxj9p08pqwxqz9hw9-4my.soap.marketingcloudapis.com/Service.asmx</a:To>\r\n        <fueloauth xmlns="http://exacttarget.com">' + SourceAccessToken + '</fueloauth>\r\n    </s:Header>\r\n    <s:Body xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">\r\n        <RetrieveRequestMsg xmlns="http://exacttarget.com/wsdl/partnerAPI">\r\n            <RetrieveRequest>\r\n                <ObjectType>DataExtensionField</ObjectType>\r\n                <Properties>Client.ID</Properties>\r\n                <Properties>CreatedDate</Properties>\r\n                <Properties>CustomerKey</Properties>\r\n                <Properties>DataExtension.CustomerKey</Properties>\r\n                <Properties>DefaultValue</Properties>\r\n                <Properties>FieldType</Properties>\r\n                <Properties>IsPrimaryKey</Properties>\r\n                <Properties>IsRequired</Properties>\r\n                <Properties>MaxLength</Properties>\r\n                <Properties>ModifiedDate</Properties>\r\n                <Properties>Name</Properties>\r\n                <Properties>ObjectID</Properties>\r\n                <Properties>Ordinal</Properties>\r\n                <Properties>Scale</Properties>\r\n\r\n                               <QueryAllAccounts>true</QueryAllAccounts>\r\n                <Retrieves />\r\n                <Options>\r\n                    <SaveOptions />\r\n                    <IncludeObjects>true</IncludeObjects>\r\n                </Options>\r\n            </RetrieveRequest>\r\n      </RetrieveRequestMsg>\r\n   </s:Body>\r\n</s:Envelope>'
    
    };
    request(DEFieldOption, function (error, response) {
      if (error) throw new Error(error);

      SourceDEFieldsResult = response.body;
      SourceDEFieldsResult = SourceDEFieldsResult.replace(/:/g, "");
      SourceDEFieldsResult = xmlParser.toJson(SourceDEFieldsResult);
      SourceDEFieldsResult = JSON.parse(SourceDEFieldsResult);
      SourceDEFieldsResult = SourceDEFieldsResult.soapEnvelope.soapBody.RetrieveResponseMsg.Results;
      //console.log('SourceDEFieldsResult :' + JSON.stringify(SourceDEFieldsResult));

      
      for (var key in SourceDEFieldsResult) {
        if(SourceDEFieldsResult[key].DataExtension.CustomerKey in DEFieldMap) {
          DEFieldMap[SourceDEFieldsResult[key].DataExtension.CustomerKey].push({
            "FieldName" : SourceDEFieldsResult[key].Name,
            "FieldIsRequired" : SourceDEFieldsResult[key].IsRequired,
            "FieldIsPrimaryKey" : SourceDEFieldsResult[key].IsPrimaryKey,
            "FieldFieldType" : SourceDEFieldsResult[key].FieldType,
            "FieldMaxLength" : SourceDEFieldsResult[key].MaxLength
          });
        }
        else {
          DEFieldMap[SourceDEFieldsResult[key].DataExtension.CustomerKey] = [{
            "FieldName" : SourceDEFieldsResult[key].Name,
            "FieldIsRequired" : SourceDEFieldsResult[key].IsRequired,
            "FieldIsPrimaryKey" : SourceDEFieldsResult[key].IsPrimaryKey,
            "FieldFieldType" : SourceDEFieldsResult[key].FieldType,
            "FieldMaxLength" : SourceDEFieldsResult[key].MaxLength
          }];
        }
      }
      //console.log('DEFieldMap : '+ JSON.stringify(DEFieldMap));
    });
    return DEFieldMap;
  }



  async function insertDEtoDestination() { 
    var DEListBody = '';
    for (var key in selectedDEList) {
      if(key in DEFieldMap) {
        console.log('Apna Loop');
        DEListBody = '<?xml version="1.0" encoding="UTF-8"?>' +
                      '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">' +
                          '<soapenv:Header>' +
                              '<fueloauth>'+DestinationAccessToken+'</fueloauth>' +
                          '</soapenv:Header>' +
                          '<soapenv:Body>' +
                              '<CreateRequest xmlns="http://exacttarget.com/wsdl/partnerAPI">' +
                                  '<Options/>' +
                                  '<Objects xsi:type="ns2:DataExtension" xmlns:ns2="http://exacttarget.com/wsdl/partnerAPI">' +
                                      '<CustomerKey>'+ selectedDEList[key].DEExtKey + 'testFzl' +'</CustomerKey>' +
                                      '<Name>'+ selectedDEList[key].DEName + 'testFzl' +'</Name>' +
                                      '<Description>'+ selectedDEList[key].DEDes +'</Description>' +
                                      '<IsSendable>'+ selectedDEList[key].DEIsSend +'</IsSendable>' +
                                      '<IsTestable>'+ selectedDEList[key].DEIsTest +'</IsTestable>';
        if(selectedDEList[key].DEIsSend == 'true') {
          DEListBody = DEListBody + '<SendableDataExtensionField>' +
                                      '<PartnerKey xsi:nil="true"/>' +
                                      '<ObjectID xsi:nil="true"/>' +
                                      '<Name>'+ selectedDEList[key].DESendDEField +'</Name>' +
                                    '</SendableDataExtensionField>' +
                                    '<SendableSubscriberField>' +
                                      '<Name>'+ selectedDEList[key].DESendSubField +'</Name>' +
                                    '</SendableSubscriberField>' +
                                  '<Fields>';
        }
        else {
          DEListBody = DEListBody + '<Fields>';
        }
                                      

        for(var i = 0 ; i< DEFieldMap[key].length ; i++) {
          if(DEFieldMap[key][i].FieldFieldType == 'Number' || DEFieldMap[key][i].FieldFieldType == 'Date' || DEFieldMap[key][i].FieldFieldType == 'Boolean') {
            console.log('NumberDateBoolean : ' + DEFieldMap[key][i].FieldFieldType);
            DEListBody = DEListBody + '<Field xsi:type="ns2:DataExtensionField">' +
                                      '<CustomerKey>'+ DEFieldMap[key][i].FieldName +'</CustomerKey>' +
                                      '<Name>'+ DEFieldMap[key][i].FieldName +'</Name>' +
                                      '<Label>'+ DEFieldMap[key][i].FieldName +'</Label>' +
                                      '<IsRequired>'+ DEFieldMap[key][i].FieldIsRequired +'</IsRequired>' +
                                      '<IsPrimaryKey>'+ DEFieldMap[key][i].FieldIsPrimaryKey +'</IsPrimaryKey>' +
                                      '<FieldType>'+ DEFieldMap[key][i].FieldFieldType +'</FieldType>' +
                                    '</Field>';
          }
          else if(DEFieldMap[key][i].FieldFieldType == 'EmailAddress'){
            console.log('EmailAddress : ' + DEFieldMap[key][i].FieldFieldType);
            DEListBody = DEListBody + '<Field xsi:type="ns2:DataExtensionField">' +
                                      '<CustomerKey>'+ DEFieldMap[key][i].FieldName +'</CustomerKey>' +
                                      '<Name>'+ DEFieldMap[key][i].FieldName +'</Name>' +
                                      '<Label>'+ DEFieldMap[key][i].FieldName +'</Label>' +
                                      '<IsRequired>'+ DEFieldMap[key][i].FieldIsRequired +'</IsRequired>' +
                                      '<IsPrimaryKey>'+ DEFieldMap[key][i].FieldIsPrimaryKey +'</IsPrimaryKey>' +
                                      '<FieldType>'+ DEFieldMap[key][i].FieldFieldType +'</FieldType>' +
                                      '<MaxLength>254</MaxLength>' +
                                    '</Field>';
          }
          else if(DEFieldMap[key][i].FieldFieldType == 'Phone'){
            console.log('Phone : ' + DEFieldMap[key][i].FieldFieldType);
            DEListBody = DEListBody + '<Field xsi:type="ns2:DataExtensionField">' +
                                      '<CustomerKey>'+ DEFieldMap[key][i].FieldName +'</CustomerKey>' +
                                      '<Name>'+ DEFieldMap[key][i].FieldName +'</Name>' +
                                      '<Label>'+ DEFieldMap[key][i].FieldName +'</Label>' +
                                      '<IsRequired>'+ DEFieldMap[key][i].FieldIsRequired +'</IsRequired>' +
                                      '<IsPrimaryKey>'+ DEFieldMap[key][i].FieldIsPrimaryKey +'</IsPrimaryKey>' +
                                      '<FieldType>'+ DEFieldMap[key][i].FieldFieldType +'</FieldType>' +
                                      '<MaxLength>50</MaxLength>' +
                                    '</Field>';
          }
          else if(DEFieldMap[key][i].FieldFieldType == 'Decimal'){
            console.log('Decimal : ' + DEFieldMap[key][i].FieldFieldType);
            DEListBody = DEListBody + '<Field xsi:type="ns2:DataExtensionField">' +
                                      '<CustomerKey>'+ DEFieldMap[key][i].FieldName +'</CustomerKey>' +
                                      '<Name>'+ DEFieldMap[key][i].FieldName +'</Name>' +
                                      '<Label>'+ DEFieldMap[key][i].FieldName +'</Label>' +
                                      '<IsRequired>'+ DEFieldMap[key][i].FieldIsRequired +'</IsRequired>' +
                                      '<IsPrimaryKey>'+ DEFieldMap[key][i].FieldIsPrimaryKey +'</IsPrimaryKey>' +
                                      '<FieldType>'+ DEFieldMap[key][i].FieldFieldType +'</FieldType>' +
                                      '<MaxLength>'+ DEFieldMap[key][i].FieldMaxLength +'</MaxLength>' +
                                    '</Field>';
          }
          else if(DEFieldMap[key][i].FieldFieldType == 'Locale'){
            console.log('Locale : ' + DEFieldMap[key][i].FieldFieldType);
            DEListBody = DEListBody + '<Field xsi:type="ns2:DataExtensionField">' +
                                      '<CustomerKey>'+ DEFieldMap[key][i].FieldName +'</CustomerKey>' +
                                      '<Name>'+ DEFieldMap[key][i].FieldName +'</Name>' +
                                      '<Label>'+ DEFieldMap[key][i].FieldName +'</Label>' +
                                      '<IsRequired>'+ DEFieldMap[key][i].FieldIsRequired +'</IsRequired>' +
                                      '<IsPrimaryKey>'+ DEFieldMap[key][i].FieldIsPrimaryKey +'</IsPrimaryKey>' +
                                      '<FieldType>'+ DEFieldMap[key][i].FieldFieldType +'</FieldType>' +
                                      '<MaxLength>5</MaxLength>' +
                                    '</Field>';
          }
          else if(DEFieldMap[key][i].FieldFieldType == 'Text'){
            console.log('Text : ' + DEFieldMap[key][i].FieldFieldType);
            DEListBody = DEListBody + '<Field xsi:type="ns2:DataExtensionField">' +
                                      '<CustomerKey>'+ DEFieldMap[key][i].FieldName +'</CustomerKey>' +
                                      '<Name>'+ DEFieldMap[key][i].FieldName +'</Name>' +
                                      '<Label>'+ DEFieldMap[key][i].FieldName +'</Label>' +
                                      '<IsRequired>'+ DEFieldMap[key][i].FieldIsRequired +'</IsRequired>' +
                                      '<IsPrimaryKey>'+ DEFieldMap[key][i].FieldIsPrimaryKey +'</IsPrimaryKey>' +
                                      '<FieldType>'+ DEFieldMap[key][i].FieldFieldType +'</FieldType>' +
                                      '<MaxLength>'+ DEFieldMap[key][i].FieldMaxLength +'</MaxLength>' +
                                    '</Field>';
          }
        }

        DEListBody = DEListBody + '</Fields>' +
                                '</Objects>' +
                            '</CreateRequest>' +
                        '</soapenv:Body>' +
                      '</soapenv:Envelope>';
      }

      //console.log('DEListBody : ' + DEListBody);
      if(DEListBody != '') {
        var DEListOption = {
          'method': 'POST',
          'url': DestinationSoapURL + 'Service.asmx',
          'headers': {
            'Content-Type': 'text/xml',
            'SoapAction': 'Create',
            'Authorization': 'Bearer ' + DestinationAccessToken
          },
          body: DEListBody
        };
        request(DEListOption, function (error, response) {
          if (error) throw new Error(error);
          console.log(response.body);
        });
      }
      DEListBody = '';
    }
  }













  app.post("/DEListShowAPI", async (req, res) => {
    if (req.body.reqForDEList = 'True') {
      SourceListDEResult = await getSourceListOfDE();
      DEFieldMap = await getSourceDEFields();

      var a = setInterval(function(){
        if(SourceListDEResult && JSON.stringify(DEFieldMap) != '{}') {
          for (var key in SourceListDEResult) {
            SourceListDEResult[key].FieldCount = DEFieldMap[SourceListDEResult[key].CustomerKey].length;
          }
          //console.log('SourceListDEResult : ' + JSON.stringify(SourceListDEResult));
          res.send(SourceListDEResult);

          clearInterval(a);
        }
      }, 500);

    }
  });














  
  app.post("/SelectedDEListInsert", async (req, res) => {
    
    if (req.body.reqForSelectedDEList) {
      selectedDEList = req.body.reqForSelectedDEList;
      console.log('reqForSelectedDEList : '+ JSON.stringify(selectedDEList));

      await insertDEtoDestination();
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