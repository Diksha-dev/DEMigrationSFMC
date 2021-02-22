const express = require("express");
const app = express();
const path = require('path');
var http = require('http');
const port = process.env.PORT || 3000
var request = require('request');
const { stringify } = require("querystring");
let xmlParser = require('xml2json');
var Set = require("collections/set");
const { log } = require("console");
var xml2js = require('xml2js');
var xml2jsParser = new xml2js.Parser();

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
var SourceDEDataResult;

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

  var FinalResult = {};


  async function authTokenForBothSFDC() {

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
    //console.log('auth chala');
  }
  authTokenForBothSFDC();

  var c = 0;
  var b = setInterval(function () {
    authTokenForBothSFDC();
    c = c + 1;
    if (c == 5) {
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








  async function getSourceListOfDE() {
    return new Promise(function (resolve, reject) {
      authTokenForBothSFDC();
      var ListDEOption = {
        'method': 'POST',
        'url': SourceSoapURL + 'Service.asmx',
        'headers': {
          'Content-Type': 'text/xml',
          'SoapAction': 'Retrieve',
          'Authorization': 'Bearer ' + SourceAccessToken
        },
        body: '<?xml version="1.0" encoding="UTF-8"?>\r\n<s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope" xmlns:a="http://schemas.xmlsoap.org/ws/2004/08/addressing" xmlns:u="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">\r\n    <s:Header>\r\n        <a:Action s:mustUnderstand="1">Retrieve</a:Action>\r\n        <a:MessageID>urn:uuid:7e0cca04-57bd-4481-864c-6ea8039d2ea0</a:MessageID>\r\n        <a:ReplyTo>\r\n            <a:Address>http://schemas.xmlsoap.org/ws/2004/08/addressing/role/anonymous</a:Address>\r\n        </a:ReplyTo>\r\n        <a:To s:mustUnderstand="1">https://mc6vgk-sxj9p08pqwxqz9hw9-4my.soap.marketingcloudapis.com/Service.asmx</a:To>\r\n        <fueloauth xmlns="http://exacttarget.com">' + SourceAccessToken + '</fueloauth>\r\n    </s:Header>\r\n    <s:Body xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">\r\n        <RetrieveRequestMsg xmlns="http://exacttarget.com/wsdl/partnerAPI">\r\n            <RetrieveRequest>\r\n                <ObjectType>DataExtension</ObjectType>\r\n                <Properties>CustomerKey</Properties>\r\n                <Properties>Name</Properties>\r\n                <Properties>DataExtension.ObjectID</Properties>\r\n                <Properties>IsSendable</Properties>\r\n          <Properties>IsTestable</Properties>\r\n             <Properties>SendableSubscriberField.Name</Properties>\r\n        <Properties>SendableDataExtensionField.Name</Properties>\r\n          <Properties>Description</Properties>\r\n                \r\n        \r\n                \r\n        \r\n             \r\n            </RetrieveRequest>\r\n      </RetrieveRequestMsg>\r\n   </s:Body>\r\n</s:Envelope>'
      };
      request(ListDEOption, function (error, response) {
        if (error) throw new Error(error);
        SourceListDEResult = response.body;


        xml2jsParser.parseString(SourceListDEResult, function (err, result) {
          //console.log('mera result : ' + JSON.stringify(result['soap:Envelope']['soap:Body'][0]['RetrieveResponseMsg'][0]['Results']));
          SourceListDEResult = result['soap:Envelope']['soap:Body'][0]['RetrieveResponseMsg'][0]['Results'];
        });

        //SourceListDEResult = SourceListDEResult.replace(/:/g, "");
        //SourceListDEResult = xmlParser.toJson(SourceListDEResult);
        //SourceListDEResult = JSON.parse(SourceListDEResult);
        //SourceListDEResult = SourceListDEResult.soapEnvelope.soapBody.RetrieveResponseMsg.Results;


        var DEListMap = {};
        for (var key in SourceListDEResult) {
          if (SourceListDEResult[key].Name[0] != "ExpressionBuilderAttributes" && SourceListDEResult[key].Name[0] != "_MobileAddress" && SourceListDEResult[key].Name[0] != "_MobileSubscription" && SourceListDEResult[key].Name[0] != "_PushAddress" && SourceListDEResult[key].Name[0] != "_PushTag" && SourceListDEResult[key].Name[0] != "_MobileLineAddressContact" && SourceListDEResult[key].Name[0] != "_MobileLineAddress" && SourceListDEResult[key].Name[0] != "_MobileLineProfile" && SourceListDEResult[key].Name[0] != "_MobileLineProfileAttribute" && SourceListDEResult[key].Name[0] != "_MobileLineSubscription" && SourceListDEResult[key].Name[0] != "MobileLineOrphanContact") {
            if (SourceListDEResult[key].IsSendable[0] == "true") {
              DEListMap[SourceListDEResult[key].CustomerKey] = {
                "DEName": SourceListDEResult[key].Name[0],
                "DECustomerKey": SourceListDEResult[key].CustomerKey[0],
                "DEIsSendable": SourceListDEResult[key].IsSendable[0],
                "DEIsTestable": SourceListDEResult[key].IsTestable[0],
                "DEDescription": SourceListDEResult[key].Description[0],
                "DESendDEField": SourceListDEResult[key].SendableDataExtensionField[0].Name[0],
                "DESendSubsField": SourceListDEResult[key].SendableSubscriberField[0].Name[0],
                "DEFieldMap": {},
                "DEDataMap": {}
              };
            }
            else {
              DEListMap[SourceListDEResult[key].CustomerKey[0]] = {
                "DEName": SourceListDEResult[key].Name[0],
                "DECustomerKey": SourceListDEResult[key].CustomerKey[0],
                "DEIsSendable": SourceListDEResult[key].IsSendable[0],
                "DEIsTestable": SourceListDEResult[key].IsTestable[0],
                "DEDescription": SourceListDEResult[key].Description[0],
                "DESendDEField": '',
                "DESendSubsField": '',
                "DEFieldMap": {},
                "DEDataMap": {}
              };
            }
          }
        }
        //console.log('DEListMap : ' + JSON.stringify(DEListMap));
        resolve(DEListMap);
      });
    })
  }

  async function getSourceDEFieldsAndData() {
    return new Promise(async function (resolve, reject) {
      authTokenForBothSFDC();
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
      request(DEFieldOption, async function (error, response) {
        if (error) throw new Error(error);

        SourceDEFieldsResult = response.body;

        xml2jsParser.parseString(SourceDEFieldsResult, function (err, result) {
          //console.log('mera result : ' + JSON.stringify(result['soap:Envelope']['soap:Body'][0]['RetrieveResponseMsg'][0]['Results']));
          SourceDEFieldsResult = result['soap:Envelope']['soap:Body'][0]['RetrieveResponseMsg'][0]['Results'];
        });

        //SourceDEFieldsResult = SourceDEFieldsResult.replace(/:/g, "");
        //SourceDEFieldsResult = xmlParser.toJson(SourceDEFieldsResult);
        //SourceDEFieldsResult = JSON.parse(SourceDEFieldsResult);
        //SourceDEFieldsResult = SourceDEFieldsResult.soapEnvelope.soapBody.RetrieveResponseMsg.Results;
        //console.log('SourceDEFieldsResult :' + JSON.stringify(SourceDEFieldsResult));

        var FieldSet = new Set();
        for (var key in SourceDEFieldsResult) {
          if (SourceDEFieldsResult[key].DataExtension[0].CustomerKey[0] in DEListMap) {
            if('Scale' in SourceDEFieldsResult[key] && 'MaxLength' in SourceDEFieldsResult[key]) {
              FieldSet.add(JSON.stringify({
                "DEExtKey": SourceDEFieldsResult[key].DataExtension[0].CustomerKey[0],
                "Name": SourceDEFieldsResult[key].Name[0],
                "IsRequired": SourceDEFieldsResult[key].IsRequired[0],
                "IsPrimaryKey": SourceDEFieldsResult[key].IsPrimaryKey[0],
                "FieldType": SourceDEFieldsResult[key].FieldType[0],
                "MaxLength": SourceDEFieldsResult[key].MaxLength[0],
                "Scale": SourceDEFieldsResult[key].Scale[0],
                "DefaultValue": SourceDEFieldsResult[key].DefaultValue[0]
              }));
            }
            else if( ('Scale' in SourceDEFieldsResult[key]) == false && 'MaxLength' in SourceDEFieldsResult[key]) {
              FieldSet.add(JSON.stringify({
                "DEExtKey": SourceDEFieldsResult[key].DataExtension[0].CustomerKey[0],
                "Name": SourceDEFieldsResult[key].Name[0],
                "IsRequired": SourceDEFieldsResult[key].IsRequired[0],
                "IsPrimaryKey": SourceDEFieldsResult[key].IsPrimaryKey[0],
                "FieldType": SourceDEFieldsResult[key].FieldType[0],
                "MaxLength": SourceDEFieldsResult[key].MaxLength[0],
                "Scale": "",
                "DefaultValue": SourceDEFieldsResult[key].DefaultValue[0]
              }));
            }
            else if('Scale' in SourceDEFieldsResult[key] && ('MaxLength' in SourceDEFieldsResult[key]) == false) {
              FieldSet.add(JSON.stringify({
                "DEExtKey": SourceDEFieldsResult[key].DataExtension[0].CustomerKey[0],
                "Name": SourceDEFieldsResult[key].Name[0],
                "IsRequired": SourceDEFieldsResult[key].IsRequired[0],
                "IsPrimaryKey": SourceDEFieldsResult[key].IsPrimaryKey[0],
                "FieldType": SourceDEFieldsResult[key].FieldType[0],
                "MaxLength": '',
                "Scale": SourceDEFieldsResult[key].Scale[0],
                "DefaultValue": SourceDEFieldsResult[key].DefaultValue[0]
              }));
            }
            else {
              FieldSet.add(JSON.stringify({
                "DEExtKey": SourceDEFieldsResult[key].DataExtension[0].CustomerKey[0],
                "Name": SourceDEFieldsResult[key].Name[0],
                "IsRequired": SourceDEFieldsResult[key].IsRequired[0],
                "IsPrimaryKey": SourceDEFieldsResult[key].IsPrimaryKey[0],
                "FieldType": SourceDEFieldsResult[key].FieldType[0],
                "MaxLength": '',
                "Scale": '',
                "DefaultValue": SourceDEFieldsResult[key].DefaultValue[0]
              }));
            }
          }
        }
        //console.log('IGO_PROFILES-FieldSet : ' + [...FieldSet]);

        var SourceDEFieldsResult = [];
        for (var val of Array.from(FieldSet)) {
          SourceDEFieldsResult.push(JSON.parse(val));
        }


        for (var key in SourceDEFieldsResult) {
          if (SourceDEFieldsResult[key].DEExtKey in DEListMap) {
            DEListMap[SourceDEFieldsResult[key].DEExtKey].DEFieldMap[SourceDEFieldsResult[key].Name] = {
              "FieldName": SourceDEFieldsResult[key].Name,
              "FieldIsRequired": SourceDEFieldsResult[key].IsRequired,
              "FieldIsPrimaryKey": SourceDEFieldsResult[key].IsPrimaryKey,
              "FieldFieldType": SourceDEFieldsResult[key].FieldType,
              "FieldMaxLength": SourceDEFieldsResult[key].MaxLength,
              "FieldScale": SourceDEFieldsResult[key].Scale,
              "FieldDefaultValue": SourceDEFieldsResult[key].DefaultValue
            };
          }
        }


        //-----------------------------------------


        for (var key in DEListMap) {
          await getDEData(key);
        }
        //console.log('DEListMap : ' + JSON.stringify(DEListMap));

        resolve(DEListMap);
      });
    })
  }

  async function getMoreData(DEDataRequestId , key) {
    return new Promise(async function (resolve, reject) {
      DEDataBody =  '<?xml version="1.0" encoding="UTF-8"?>' +
                          '<s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope" xmlns:a="http://schemas.xmlsoap.org/ws/2004/08/addressing" xmlns:u="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">' +
                              '<s:Header>' +
                                  '<a:Action s:mustUnderstand="1">Retrieve</a:Action>' +
                                  '<a:MessageID>urn:uuid:7e0cca04-57bd-4481-864c-6ea8039d2ea0</a:MessageID>' +
                                  '<a:ReplyTo>' +
                                      '<a:Address>http://schemas.xmlsoap.org/ws/2004/08/addressing/role/anonymous</a:Address>' +
                                  '</a:ReplyTo>' +
                                  '<a:To s:mustUnderstand="1">' + SourceSoapURL + 'Service.asmx</a:To>' +
                                  '<fueloauth xmlns="http://exacttarget.com">' + SourceAccessToken + '</fueloauth>' +
                              '</s:Header>' +
                              '<s:Body xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">' +
                                  '<RetrieveRequestMsg xmlns="http://exacttarget.com/wsdl/partnerAPI">' +
                                      '<RetrieveRequest>' +
                                          '<ContinueRequest>' + DEDataRequestId + '</ContinueRequest>' +
                                          '<Options>' +
                                              '<BatchSize>2500</BatchSize>' +
                                          '</Options>' +
                                      '</RetrieveRequest>' +
                                  '</RetrieveRequestMsg>' +
                              '</s:Body>' +
                          '</s:Envelope>';

      //console.log(key + 'innerBody : ' + DEDataBody);
      DEDataOptions = {
        'method': 'POST',
        'url': SourceSoapURL + 'Service.asmx',
        'headers': {
          'Content-Type': 'text/xml',
          'SoapAction': 'Retrieve',
          'Authorization': 'Bearer ' + SourceAccessToken
        },
        body: DEDataBody
      };
      request(DEDataOptions, function (error, response) {
        if (error) throw new Error(error);
        //console.log('wah bhai wah : ' + response.body);

        xml2jsParser.parseString(response.body, function (err, result) {
          SourceDEDataResult = result['soap:Envelope']['soap:Body'][0]['RetrieveResponseMsg'][0]['Results'];
          DEDataRequestId = result['soap:Envelope']['soap:Body'][0]['RetrieveResponseMsg'][0]['RequestID'][0];
        });
        
        if(SourceDEDataResult){
          tempLength = SourceDEDataResult.length;
        }
        else {
          tempLength = 0;
        }

        for (var key1 in SourceDEDataResult) {
          DEListMap[key].DEDataMap.push(SourceDEDataResult[key1].Properties[0]);
        }
        console.log('wah bhai wah : ' + tempLength);
        resolve(tempLength);
      })
    })
  }

  async function getDEData(key) {
    return new Promise( async function (resolve, reject) {
      var DEDataBody = '';
      DEDataBody =  '<?xml version="1.0" encoding="UTF-8"?>' +
                    '<s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope" xmlns:a="http://schemas.xmlsoap.org/ws/2004/08/addressing" xmlns:u="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">' +
                      '<s:Header>' +
                        '<a:Action s:mustUnderstand="1">Retrieve</a:Action>' +
                        '<a:MessageID>urn:uuid:7e0cca04-57bd-4481-864c-6ea8039d2ea0</a:MessageID>' +
                        '<a:ReplyTo>' +
                          '<a:Address>http://schemas.xmlsoap.org/ws/2004/08/addressing/role/anonymous</a:Address>' +
                        '</a:ReplyTo>' +
                        '<a:To s:mustUnderstand="1">' + SourceSoapURL + 'Service.asmx' + '</a:To>' +
                        '<fueloauth xmlns="http://exacttarget.com">' + SourceAccessToken + '</fueloauth>' +
                      '</s:Header>' +
                      '<s:Body xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">' +
                        '<RetrieveRequestMsg xmlns="http://exacttarget.com/wsdl/partnerAPI">' +
                          '<RetrieveRequest>' +
                            '<ObjectType>DataExtensionObject[' + key + ']</ObjectType>';
      for (var key1 in DEListMap[key].DEFieldMap) {
        DEDataBody = DEDataBody + '<Properties>' + DEListMap[key].DEFieldMap[key1]["FieldName"] + '</Properties>';
      }
      DEDataBody = DEDataBody + '<Options>' +
                                  '<BatchSize>2500</BatchSize>' +
                                '</Options>' +
                                '</RetrieveRequest>' +
                              '</RetrieveRequestMsg>' +
                            '</s:Body>' +
                          '</s:Envelope>';

      //console.log('DEDataBody : ' + DEDataBody);
      var DEDataOptions = {
        'method': 'POST',
        'url': SourceSoapURL + 'Service.asmx',
        'headers': {
          'Content-Type': 'text/xml',
          'SoapAction': 'Retrieve',
          'Authorization': 'Bearer ' + SourceAccessToken
        },
        body: DEDataBody
      };

      request(DEDataOptions, async function (error, response) {
        if (error) throw new Error(error);
        //console.log(DEListMap[key].DEName + ' : DE Data : ' + JSON.stringify(response.body));

        var DEDataRequestId;

        SourceDEDataResult = response.body;
        xml2jsParser.parseString(SourceDEDataResult, function (err, result) {
          //console.log('mera result : ' + JSON.stringify(result['soap:Envelope']['soap:Body'][0]['RetrieveResponseMsg'][0]['Results']));
          //console.log('mera result : ' + JSON.stringify(result['soap:Envelope']['soap:Body'][0]['RetrieveResponseMsg'][0]['RequestID'][0]));
          SourceDEDataResult = result['soap:Envelope']['soap:Body'][0]['RetrieveResponseMsg'][0]['Results'];
          DEDataRequestId = result['soap:Envelope']['soap:Body'][0]['RetrieveResponseMsg'][0]['RequestID'][0]
        });

        DEListMap[key].DEDataMap = [];
        if(SourceDEDataResult) {
          
          if(SourceDEDataResult.length == 2500) {
            console.log('if');
            for (var key1 in SourceDEDataResult) {
              DEListMap[key].DEDataMap.push(SourceDEDataResult[key1].Properties[0]); 
            }
            var tempLength = SourceDEDataResult.length;
            while(tempLength == 2500) {
              tempLength = await getMoreData(DEDataRequestId , key);
            }
          }
          else {
            //console.log('Length : ' + SourceDEDataResult.length);
            //SourceDEDataResult = SourceDEDataResult.replace(/:/g, "");
            //SourceDEDataResult = xmlParser.toJson(SourceDEDataResult);
            //SourceDEDataResult = JSON.parse(SourceDEDataResult);
            //SourceDEDataResult = SourceDEDataResult.soapEnvelope.soapBody.RetrieveResponseMsg.Results;
            console.log('else');
            for (var key1 in SourceDEDataResult) {
              DEListMap[key].DEDataMap.push(SourceDEDataResult[key1].Properties[0]);
              
              /*if (key1 != 'xsitype' && key1 != 'PartnerKey' && key1 != 'ObjectID' && key1 != 'Type' && key1 != 'Properties') {
                DEListMap[key].DEDataMap.push(SourceDEDataResult[key1].Properties);
              }
              else if (key1 == 'Properties') {
                DEListMap[key].DEDataMap.push(SourceDEDataResult["Properties"]);
              }*/
              
            }
            //console.log(key + ' : mera result : ' + JSON.stringify(DEListMap[key].DEDataMap));
          }
        }
        
        resolve(DEListMap[key].DEDataMap);
      });
    })
  }



  async function insertDEtoDestination(key) {
    return new Promise(function (resolve, reject) {
      var DEListBody = '';
      if (key in DEListMap) {
        DEListBody = '<?xml version="1.0" encoding="UTF-8"?>' +
          '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">' +
          '<soapenv:Header>' +
          '<fueloauth>' + DestinationAccessToken + '</fueloauth>' +
          '</soapenv:Header>' +
          '<soapenv:Body>' +
          '<CreateRequest xmlns="http://exacttarget.com/wsdl/partnerAPI">' +
          '<Options/>' +
          '<Objects xsi:type="ns2:DataExtension" xmlns:ns2="http://exacttarget.com/wsdl/partnerAPI">' +
          '<CustomerKey>' + selectedDEList.WithoutData[key].DEExtKey + '</CustomerKey>' +
          '<Name>' + selectedDEList.WithoutData[key].DEName + '</Name>' +
          '<Description>' + selectedDEList.WithoutData[key].DEDes + '</Description>' +
          '<IsSendable>' + selectedDEList.WithoutData[key].DEIsSend + '</IsSendable>' +
          '<IsTestable>' + selectedDEList.WithoutData[key].DEIsTest + '</IsTestable>';
        if (selectedDEList.WithoutData[key].DEIsSend == 'true') {
          DEListBody = DEListBody + '<SendableDataExtensionField>' +
            '<PartnerKey xsi:nil="true"/>' +
            '<ObjectID xsi:nil="true"/>' +
            '<Name>' + selectedDEList.WithoutData[key].DESendDEField + '</Name>' +
            '</SendableDataExtensionField>' +
            '<SendableSubscriberField>' +
            '<Name>' + selectedDEList.WithoutData[key].DESendSubField + '</Name>' +
            '</SendableSubscriberField>' +
            '<Fields>';
        }
        else {
          DEListBody = DEListBody + '<Fields>';
        }

        var tempDefaultValue = '';
        var tempMaxLength;
        for (var i in DEListMap[key].DEFieldMap) {
          if (DEListMap[key].DEFieldMap[i].FieldFieldType == 'Number' || DEListMap[key].DEFieldMap[i].FieldFieldType == 'Date' || DEListMap[key].DEFieldMap[i].FieldFieldType == 'Boolean') {
            if (JSON.stringify(DEListMap[key].DEFieldMap[i].FieldDefaultValue) == '{}') {
              tempDefaultValue = '';
            }
            else {
              tempDefaultValue = DEListMap[key].DEFieldMap[i].FieldDefaultValue;
            }
            DEListBody = DEListBody + '<Field xsi:type="ns2:DataExtensionField">' +
              '<CustomerKey>' + DEListMap[key].DEFieldMap[i].FieldName + '</CustomerKey>' +
              '<Name>' + DEListMap[key].DEFieldMap[i].FieldName + '</Name>' +
              '<Label>' + DEListMap[key].DEFieldMap[i].FieldName + '</Label>' +
              '<IsRequired>' + DEListMap[key].DEFieldMap[i].FieldIsRequired + '</IsRequired>' +
              '<IsPrimaryKey>' + DEListMap[key].DEFieldMap[i].FieldIsPrimaryKey + '</IsPrimaryKey>' +
              '<FieldType>' + DEListMap[key].DEFieldMap[i].FieldFieldType + '</FieldType>' +
              '<DefaultValue>' + tempDefaultValue + '</DefaultValue>' +
              '</Field>';
          }
          else if (DEListMap[key].DEFieldMap[i].FieldFieldType == 'EmailAddress') {
            DEListBody = DEListBody + '<Field xsi:type="ns2:DataExtensionField">' +
              '<CustomerKey>' + DEListMap[key].DEFieldMap[i].FieldName + '</CustomerKey>' +
              '<Name>' + DEListMap[key].DEFieldMap[i].FieldName + '</Name>' +
              '<Label>' + DEListMap[key].DEFieldMap[i].FieldName + '</Label>' +
              '<IsRequired>' + DEListMap[key].DEFieldMap[i].FieldIsRequired + '</IsRequired>' +
              '<IsPrimaryKey>' + DEListMap[key].DEFieldMap[i].FieldIsPrimaryKey + '</IsPrimaryKey>' +
              '<FieldType>' + DEListMap[key].DEFieldMap[i].FieldFieldType + '</FieldType>' +
              '<MaxLength>254</MaxLength>' +
              '</Field>';
          }
          else if (DEListMap[key].DEFieldMap[i].FieldFieldType == 'Phone') {
            DEListBody = DEListBody + '<Field xsi:type="ns2:DataExtensionField">' +
              '<CustomerKey>' + DEListMap[key].DEFieldMap[i].FieldName + '</CustomerKey>' +
              '<Name>' + DEListMap[key].DEFieldMap[i].FieldName + '</Name>' +
              '<Label>' + DEListMap[key].DEFieldMap[i].FieldName + '</Label>' +
              '<IsRequired>' + DEListMap[key].DEFieldMap[i].FieldIsRequired + '</IsRequired>' +
              '<IsPrimaryKey>' + DEListMap[key].DEFieldMap[i].FieldIsPrimaryKey + '</IsPrimaryKey>' +
              '<FieldType>' + DEListMap[key].DEFieldMap[i].FieldFieldType + '</FieldType>' +
              '<MaxLength>50</MaxLength>' +
              '</Field>';
          }
          else if (DEListMap[key].DEFieldMap[i].FieldFieldType == 'Decimal') {
            if (JSON.stringify(DEListMap[key].DEFieldMap[i].FieldDefaultValue) == '{}') {
              tempDefaultValue = '';
            }
            else {
              tempDefaultValue = DEListMap[key].DEFieldMap[i].FieldDefaultValue;
            }

            
            if (DEListMap[key].DEFieldMap[i].FieldMaxLength) {
              tempMaxLength = DEListMap[key].DEFieldMap[i].FieldMaxLength;
            }
            else {
              tempMaxLength = 100;
            }

            DEListBody = DEListBody + '<Field xsi:type="ns2:DataExtensionField">' +
              '<CustomerKey>' + DEListMap[key].DEFieldMap[i].FieldName + '</CustomerKey>' +
              '<Name>' + DEListMap[key].DEFieldMap[i].FieldName + '</Name>' +
              '<Label>' + DEListMap[key].DEFieldMap[i].FieldName + '</Label>' +
              '<IsRequired>' + DEListMap[key].DEFieldMap[i].FieldIsRequired + '</IsRequired>' +
              '<IsPrimaryKey>' + DEListMap[key].DEFieldMap[i].FieldIsPrimaryKey + '</IsPrimaryKey>' +
              '<FieldType>' + DEListMap[key].DEFieldMap[i].FieldFieldType + '</FieldType>' +
              '<MaxLength>' + tempMaxLength + '</MaxLength>' +
              '<Scale>' + DEListMap[key].DEFieldMap[i].FieldScale + '</Scale>' +
              '<DefaultValue>' + tempDefaultValue + '</DefaultValue>' +
              '</Field>';
          }
          else if (DEListMap[key].DEFieldMap[i].FieldFieldType == 'Locale') {
            DEListBody = DEListBody + '<Field xsi:type="ns2:DataExtensionField">' +
              '<CustomerKey>' + DEListMap[key].DEFieldMap[i].FieldName + '</CustomerKey>' +
              '<Name>' + DEListMap[key].DEFieldMap[i].FieldName + '</Name>' +
              '<Label>' + DEListMap[key].DEFieldMap[i].FieldName + '</Label>' +
              '<IsRequired>' + DEListMap[key].DEFieldMap[i].FieldIsRequired + '</IsRequired>' +
              '<IsPrimaryKey>' + DEListMap[key].DEFieldMap[i].FieldIsPrimaryKey + '</IsPrimaryKey>' +
              '<FieldType>' + DEListMap[key].DEFieldMap[i].FieldFieldType + '</FieldType>' +
              '<MaxLength>5</MaxLength>' +
              '</Field>';
          }
          else if (DEListMap[key].DEFieldMap[i].FieldFieldType == 'Text') {
            if (JSON.stringify(DEListMap[key].DEFieldMap[i].FieldDefaultValue) == '{}') {
              tempDefaultValue = '';
            }
            else {
              tempDefaultValue = DEListMap[key].DEFieldMap[i].FieldDefaultValue;
            }

            if (DEListMap[key].DEFieldMap[i].FieldMaxLength) {
              tempMaxLength = DEListMap[key].DEFieldMap[i].FieldMaxLength;
            }
            else {
              tempMaxLength = 100;
            }

            DEListBody = DEListBody + '<Field xsi:type="ns2:DataExtensionField">' +
              '<CustomerKey>' + DEListMap[key].DEFieldMap[i].FieldName + '</CustomerKey>' +
              '<Name>' + DEListMap[key].DEFieldMap[i].FieldName + '</Name>' +
              '<Label>' + DEListMap[key].DEFieldMap[i].FieldName + '</Label>' +
              '<IsRequired>' + DEListMap[key].DEFieldMap[i].FieldIsRequired + '</IsRequired>' +
              '<IsPrimaryKey>' + DEListMap[key].DEFieldMap[i].FieldIsPrimaryKey + '</IsPrimaryKey>' +
              '<FieldType>' + DEListMap[key].DEFieldMap[i].FieldFieldType + '</FieldType>' +
              '<MaxLength>' + tempMaxLength + '</MaxLength>' +
              '<DefaultValue>' + tempDefaultValue + '</DefaultValue>' +
              '</Field>';
          }
        }

        DEListBody = DEListBody + '</Fields>' +
          '</Objects>' +
          '</CreateRequest>' +
          '</soapenv:Body>' +
          '</soapenv:Envelope>';


        //console.log(DEListMap[key].DEName + ' : DEInsertListBody : ' + DEListBody);

        if (DEListBody != '') {
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
          request(DEListOption, async function (error, response) {
            if (error) throw new Error(error);

            var tempDEInsertResult;
            xml2jsParser.parseString(response.body, function (err, result) {
              tempDEInsertResult = result['soap:Envelope']['soap:Body'][0]['CreateResponse'][0]['Results'];
            });

            //console.log(DEListMap[key].DEName + ' : DEInsert statusCode : ' + response.statusCode + ' , Body : ' + JSON.stringify(tempDEInsertResult));
            
            if(tempDEInsertResult[0]["StatusMessage"] == "Updating an existing Data Extension definition is not allowed when doing an add-only operation. ") {
              FinalResult[key] = {
                "DEInsert" : {
                  "Name" : DEListMap[key].DEName,
                  "StatusCode" : response.statusCode,
                  "StatusMessage" : tempDEInsertResult[0]["StatusCode"][0],
                  "Description" : "This Data extention Name or External Key is already exist in Destination SFMC Instance"
                },
                "DEDataInsert" : {
                  "Name" : "-",
                  "StatusCode" : "-",
                  "StatusMessage" : "-",
                  "Description" : "-"
                }
              };
            }
            else {
              FinalResult[key] = {
                "DEInsert" : {
                  "Name" : DEListMap[key].DEName,
                  "StatusCode" : response.statusCode,
                  "StatusMessage" : tempDEInsertResult[0]["StatusCode"][0],
                  "Description" : tempDEInsertResult[0]["StatusMessage"][0]
                },
                "DEDataInsert" : {
                  "Name" : "-",
                  "StatusCode" : "-",
                  "StatusMessage" : "-",
                  "Description" : "-"
                }
              };
            }

            resolve(FinalResult);
          });
        }
      }
    })
  }

  async function insertDEDataToDestination(key) {
    return new Promise(function (resolve, reject) {
      var DEDataInsertWithoutPrimaryKeyBody = '';
      var DEDataInsertWithPrimaryKeyBody = '';
      var PrimaryKeyCheck;
      if(DEListMap[key].DEDataMap.length != 0) {
        for(var key0 in DEListMap[key].DEFieldMap) {
          if(DEListMap[key].DEFieldMap[key0].FieldIsPrimaryKey == "true") {
            PrimaryKeyCheck = true;
            break;
          }
          else {
            PrimaryKeyCheck = false;
          }
        }
        if(PrimaryKeyCheck == true) {
          var DEDataInsertWithPrimaryKeyBodyForKeys='';
          var DEDataInsertWithPrimaryKeyBodyForValues='';

          for(var key1 in DEListMap[key].DEDataMap) {
            DEDataInsertWithPrimaryKeyBodyForKeys='';
            DEDataInsertWithPrimaryKeyBodyForValues='';
            for(var key2 in DEListMap[key].DEDataMap[key1].Property) {
              if(JSON.stringify(DEListMap[key].DEDataMap[key1].Property[key2].Value[0]) != '{}') {
                if(DEListMap[key].DEFieldMap[DEListMap[key].DEDataMap[key1].Property[key2].Name[0]]["FieldIsPrimaryKey"] == "true") {
                  DEDataInsertWithPrimaryKeyBodyForKeys = DEDataInsertWithPrimaryKeyBodyForKeys + '"' + DEListMap[key].DEDataMap[key1].Property[key2].Name[0] +'":"' + DEListMap[key].DEDataMap[key1].Property[key2].Value[0] +'",';
                }
                else {
                  DEDataInsertWithPrimaryKeyBodyForValues = DEDataInsertWithPrimaryKeyBodyForValues + '"' + DEListMap[key].DEDataMap[key1].Property[key2].Name[0] +'":"' + DEListMap[key].DEDataMap[key1].Property[key2].Value[0] +'",';
                }
              }
            }
            DEDataInsertWithPrimaryKeyBodyForKeys = DEDataInsertWithPrimaryKeyBodyForKeys.slice(0, -1);
            DEDataInsertWithPrimaryKeyBodyForValues = DEDataInsertWithPrimaryKeyBodyForValues.slice(0, -1);
            DEDataInsertWithPrimaryKeyBody = DEDataInsertWithPrimaryKeyBody + '{"keys":{' + DEDataInsertWithPrimaryKeyBodyForKeys + '},"values":{' + DEDataInsertWithPrimaryKeyBodyForValues + '}},';
          }
          DEDataInsertWithPrimaryKeyBody = DEDataInsertWithPrimaryKeyBody.slice(0, -1);
          DEDataInsertWithPrimaryKeyBody = '[' + DEDataInsertWithPrimaryKeyBody + ']';
          //console.log(DEListMap[key].DEName + ' : DEDataInsertWithPrimaryKeyBody : ' + DEDataInsertWithPrimaryKeyBody)
          var DEdataInsertWithPrimaryKeyOptions = {
            'method': 'POST',
            'url': DestinationRestURL + 'hub/v1/dataevents/key:' + key + '/rowset',
            'headers': {
              'Authorization': 'Bearer ' + DestinationAccessToken,
              'Content-Type': 'application/json'
            },
            body: DEDataInsertWithPrimaryKeyBody
          };
          request(DEdataInsertWithPrimaryKeyOptions, function (error, response) {
            if (error) throw new Error(error);
              //console.log(DEListMap[key].DEName + ' : DEDataInsert statusCode : ' + response.statusCode + ' , Body : ' + JSON.stringify(response));
              FinalResult[key]["DEDataInsert"]["Name"] = DEListMap[key].DEName;
              FinalResult[key]["DEDataInsert"]["StatusCode"] = response.statusCode;
              if(response.statusCode == 202 || response.statusCode == 200) {
                FinalResult[key]["DEDataInsert"]["StatusMessage"] = "ok";
                FinalResult[key]["DEDataInsert"]["Description"] = "Success";
              }
              else {
                FinalResult[key]["DEDataInsert"]["StatusMessage"] = response.body.resultMessages[0];
                FinalResult[key]["DEDataInsert"]["Description"] = "-";
              }
              //console.log('FinalResult : ' + JSON.stringify(FinalResult));
            resolve(FinalResult);
          });
        }
        else {
          var DEDataInsertWithoutPrimaryKeyInnerBody = ''
          for(var key1 in DEListMap[key].DEDataMap) {
            DEDataInsertWithoutPrimaryKeyInnerBody = '';
            for(var key2 in DEListMap[key].DEDataMap[key1].Property) {
              if(JSON.stringify(DEListMap[key].DEDataMap[key1].Property[key2].Value[0]) != '{}') {
                DEDataInsertWithoutPrimaryKeyInnerBody = DEDataInsertWithoutPrimaryKeyInnerBody + ' "' + DEListMap[key].DEDataMap[key1].Property[key2].Name[0] + '" : "' + DEListMap[key].DEDataMap[key1].Property[key2].Value[0] + '" ,';
              }
            }
            DEDataInsertWithoutPrimaryKeyInnerBody = DEDataInsertWithoutPrimaryKeyInnerBody.slice(0, -1);
            DEDataInsertWithoutPrimaryKeyBody = DEDataInsertWithoutPrimaryKeyBody + '{' + DEDataInsertWithoutPrimaryKeyInnerBody + '},';
          }
          DEDataInsertWithoutPrimaryKeyBody = DEDataInsertWithoutPrimaryKeyBody.slice(0, -1);
          DEDataInsertWithoutPrimaryKeyBody = '{"items":[' + DEDataInsertWithoutPrimaryKeyBody + ']}';
          //console.log(key + ' : DEDataInsertWithoutPrimaryKeyBody : ' + DEDataInsertWithoutPrimaryKeyBody);
          var DEDataInsertwithoutPrimarykeyOption = {
            'method': 'POST',
            'url': DestinationRestURL + 'data/v1/async/dataextensions/key:' + key + '/rows',
            'headers': {
              'Authorization': 'Bearer ' + DestinationAccessToken,
              'Content-Type': 'application/json'
            },
            body: DEDataInsertWithoutPrimaryKeyBody
          };
          request(DEDataInsertwithoutPrimarykeyOption, function (error, response) {
            if (error) throw new Error(error);
            FinalResult[key]["DEDataInsert"]["Name"] = DEListMap[key].DEName;
            FinalResult[key]["DEDataInsert"]["StatusCode"] = response.statusCode;
            if(response.statusCode == 202 || response.statusCode == 200) {
              FinalResult[key]["DEDataInsert"]["StatusMessage"] = "ok";
              FinalResult[key]["DEDataInsert"]["Description"] = "Success";
            }
            else {
              FinalResult[key]["DEDataInsert"]["StatusMessage"] = response.body.resultMessages[0];
              FinalResult[key]["DEDataInsert"]["Description"] = "-";
            }
            resolve(FinalResult);
          });
        }
      }
    })
  }





  app.post("/DEListShowAPI", async (req, res) => {
    if (req.body.reqForDEList = 'True') {
      DEListMap = await getSourceListOfDE();
      DEListMap = await getSourceDEFieldsAndData();
      // console.log('DEListMap Last : ' + JSON.stringify(DEListMap));
      for (var key in DEListMap) {
        DEListMap[key].FieldCount = Object.keys(DEListMap[key].DEFieldMap).length;
        DEListMap[key].RecordCount = DEListMap[key].DEDataMap.length;
      }
      res.send(DEListMap);
    }
  });

  app.post("/SelectedDEListInsert", async (req, res) => {
    if (req.body.reqForSelectedDEList) {
      selectedDEList = req.body.reqForSelectedDEList;
      //console.log('reqForSelectedDEList : ' + JSON.stringify(selectedDEList));
      for (var key in selectedDEList.WithoutData) {
        FinalResult = await insertDEtoDestination(key);
      }
      for(var key in selectedDEList.WithData) {
        FinalResult = await insertDEDataToDestination(key);
      }
      console.log('FinalResult : ' + JSON.stringify(FinalResult));
    }
    res.send(FinalResult);
  });












});
app.listen(port, () => {
  console.log('Example app is listening on port http://localhost:${port}');
});