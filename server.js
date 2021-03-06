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
const Math = require("mathjs");
const { json } = require("mathjs");
var nodemailer = require('nodemailer');


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
var DEListMap = {};

var SourceListSharedDEResult;
var SourceSharedDEFieldsResult;
var SharedDEListMap = {};

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

  var DEListSend = {};
  var selectedDEList;

  var SharedDEListSend = {};

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

  /*var c = 0;
  var b = setInterval(function () {
    authTokenForBothSFDC();
    c = c + 1;
    if (c == 5) {
      clearInterval(b);
    }
  }, 1000000);*/














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
        body: '<?xml version="1.0" encoding="UTF-8"?>\r\n<s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope" xmlns:a="http://schemas.xmlsoap.org/ws/2004/08/addressing" xmlns:u="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">\r\n    <s:Header>\r\n        <a:Action s:mustUnderstand="1">Retrieve</a:Action>\r\n        <a:MessageID>urn:uuid:7e0cca04-57bd-4481-864c-6ea8039d2ea0</a:MessageID>\r\n        <a:ReplyTo>\r\n            <a:Address>http://schemas.xmlsoap.org/ws/2004/08/addressing/role/anonymous</a:Address>\r\n        </a:ReplyTo>\r\n        <a:To s:mustUnderstand="1">' + SourceSoapURL + 'Service.asmx</a:To>\r\n        <fueloauth xmlns="http://exacttarget.com">' + SourceAccessToken + '</fueloauth>\r\n    </s:Header>\r\n    <s:Body xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">\r\n        <RetrieveRequestMsg xmlns="http://exacttarget.com/wsdl/partnerAPI">\r\n            <RetrieveRequest>\r\n                <ObjectType>DataExtension</ObjectType>\r\n                <Properties>CustomerKey</Properties>\r\n                <Properties>Name</Properties>\r\n                <Properties>DataExtension.ObjectID</Properties>\r\n                <Properties>IsSendable</Properties>\r\n          <Properties>IsTestable</Properties>\r\n             <Properties>SendableSubscriberField.Name</Properties>\r\n        <Properties>SendableDataExtensionField.Name</Properties>\r\n          <Properties>Description</Properties>\r\n                \r\n        \r\n                \r\n        \r\n             \r\n            </RetrieveRequest>\r\n      </RetrieveRequestMsg>\r\n   </s:Body>\r\n</s:Envelope>'
      };
      request(ListDEOption, function (error, response) {
        if (error) throw new Error(error);
        SourceListDEResult = response.body;
        xml2jsParser.parseString(SourceListDEResult, function (err, result) {
          SourceListDEResult = result['soap:Envelope']['soap:Body'][0]['RetrieveResponseMsg'][0]['Results'];
        });

        //SourceListDEResult = SourceListDEResult.replace(/:/g, "");
        //SourceListDEResult = xmlParser.toJson(SourceListDEResult);
        //SourceListDEResult = JSON.parse(SourceListDEResult);
        //SourceListDEResult = SourceListDEResult.soapEnvelope.soapBody.RetrieveResponseMsg.Results;

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
                "RecordCount": 0,
                "DEFieldMap": {},
                "DEDataMap": []
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
                "RecordCount": 0,
                "DEFieldMap": {},
                "DEDataMap": []
              };
            }
          }
        }
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
        body: '<?xml version="1.0" encoding="UTF-8"?>\r\n<s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope" xmlns:a="http://schemas.xmlsoap.org/ws/2004/08/addressing" xmlns:u="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">\r\n    <s:Header>\r\n        <a:Action s:mustUnderstand="1">Retrieve</a:Action>\r\n        <a:MessageID>urn:uuid:7e0cca04-57bd-4481-864c-6ea8039d2ea0</a:MessageID>\r\n        <a:ReplyTo>\r\n            <a:Address>http://schemas.xmlsoap.org/ws/2004/08/addressing/role/anonymous</a:Address>\r\n        </a:ReplyTo>\r\n        <a:To s:mustUnderstand="1">' + SourceSoapURL + 'Service.asmx</a:To>\r\n        <fueloauth xmlns="http://exacttarget.com">' + SourceAccessToken + '</fueloauth>\r\n    </s:Header>\r\n    <s:Body xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">\r\n        <RetrieveRequestMsg xmlns="http://exacttarget.com/wsdl/partnerAPI">\r\n            <RetrieveRequest>\r\n                <ObjectType>DataExtensionField</ObjectType>\r\n                <Properties>Client.ID</Properties>\r\n                <Properties>CreatedDate</Properties>\r\n                <Properties>CustomerKey</Properties>\r\n                <Properties>DataExtension.CustomerKey</Properties>\r\n                <Properties>DefaultValue</Properties>\r\n                <Properties>FieldType</Properties>\r\n                <Properties>IsPrimaryKey</Properties>\r\n                <Properties>IsRequired</Properties>\r\n                <Properties>MaxLength</Properties>\r\n                <Properties>ModifiedDate</Properties>\r\n                <Properties>Name</Properties>\r\n                <Properties>ObjectID</Properties>\r\n                <Properties>Ordinal</Properties>\r\n                <Properties>Scale</Properties>\r\n\r\n                               <QueryAllAccounts>true</QueryAllAccounts>\r\n                <Retrieves />\r\n                <Options>\r\n                    <SaveOptions />\r\n                    <IncludeObjects>true</IncludeObjects>\r\n                </Options>\r\n            </RetrieveRequest>\r\n      </RetrieveRequestMsg>\r\n   </s:Body>\r\n</s:Envelope>'
      };
      request(DEFieldOption, async function (error, response) {
        if (error) throw new Error(error);
        SourceDEFieldsResult = response.body;
        xml2jsParser.parseString(SourceDEFieldsResult, function (err, result) {
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
            if ('Scale' in SourceDEFieldsResult[key] && 'MaxLength' in SourceDEFieldsResult[key]) {
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
            else if (('Scale' in SourceDEFieldsResult[key]) == false && 'MaxLength' in SourceDEFieldsResult[key]) {
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
            else if ('Scale' in SourceDEFieldsResult[key] && ('MaxLength' in SourceDEFieldsResult[key]) == false) {
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
          await getDERecordCount(key);
        }
        //console.log('DEListMap : ' + JSON.stringify(DEListMap));

        resolve(DEListMap);
      });
    })
  }

  async function getDERecordCount(key) {
    return new Promise(async function (resolve, reject) {
      var DEDataOptions = {
        'method': 'GET',
        'url': SourceRestURL + 'data/v1/customobjectdata/key/' + key + '/rowset/?$page=1&$pagesize=1',
        'headers': {
          'Authorization': 'Bearer ' + SourceAccessToken
        }
      };
      request(DEDataOptions, async function (error, response) {
        if (error) throw new Error(error);
        var tempResult = JSON.parse(response.body);
        DEListMap[key].RecordCount = tempResult.count;
        DEListSend[key] = {
          "DEName": DEListMap[key].DEName,
          "DECustomerKey": DEListMap[key].DECustomerKey,
          "FieldCount": Object.keys(DEListMap[key].DEFieldMap).length,
          "RecordCount": tempResult.count,
          "DEDescription": DEListMap[key].DEDescription,
          "DEIsSendable": DEListMap[key].DEIsSendable,
          "DEIsTestable": DEListMap[key].DEIsTestable,
          "DESendDEField": DEListMap[key].DESendDEField,
          "DESendSubsField": DEListMap[key].DESendSubsField
        };
        resolve(DEListSend);
      });
    })
  }





  async function getDEData(key) {
    return new Promise(async function (resolve, reject) {

      var NextUrl;
      var DEDataOptions = {
        'method': 'GET',
        'url': SourceRestURL + 'data/v1/customobjectdata/key/' + key + '/rowset/',
        'headers': {
          'Authorization': 'Bearer ' + SourceAccessToken
        }
      };
      request(DEDataOptions, async function (error, response) {
        if (error) throw new Error(error);
        var tempResult = JSON.parse(response.body);

        if(tempResult.count != 0) {
          if(Object.keys(tempResult.items[0].keys).length != 0) {
            DEListMap[key].DEDataMap.push.apply(DEListMap[key].DEDataMap, tempResult.items);
          }
          else {
            for(var i in tempResult.items) {
              DEListMap[key].DEDataMap.push(tempResult.items[i].values);
            }
          }
        }
        
        var looplength = Math.ceil(tempResult.count / tempResult.pageSize);
        if (looplength >= 2) {
          NextUrl = tempResult.links.next;
          for (var i = 2; i <= looplength; i++) {
            NextUrl = await getMoreData(NextUrl, key);
          }
        }
        resolve(DEListMap);
      });
    })
  }

  async function getMoreData(NextUrl, key) {
    return new Promise(async function (resolve, reject) {

      var DEMoreDataOptions = {
        'method': 'GET',
        'url': SourceRestURL + 'data' + NextUrl,
        'headers': {
          'Authorization': 'Bearer ' + SourceAccessToken
        }
      };
      request(DEMoreDataOptions, function (error, response) {
        if (error) throw new Error(error);
        var tempResult1 = JSON.parse(response.body);

        if(tempResult1.count != 0) {
          if(Object.keys(tempResult1.items[0].keys).length != 0) {
            DEListMap[key].DEDataMap.push.apply(DEListMap[key].DEDataMap, tempResult1.items);
          }
          else {
            for(var i in tempResult1.items) {
              DEListMap[key].DEDataMap.push(tempResult1.items[i].values);
            }
          }
        }

        NextUrl = tempResult1.links.next;
        resolve(NextUrl);
      })

    })
  }



  /*
  //this is soap api to get records
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

        var DEDataRequestId;
        SourceDEDataResult = response.body;
        xml2jsParser.parseString(SourceDEDataResult, function (err, result) {
          SourceDEDataResult = result['soap:Envelope']['soap:Body'][0]['RetrieveResponseMsg'][0]['Results'];
          DEDataRequestId = result['soap:Envelope']['soap:Body'][0]['RetrieveResponseMsg'][0]['RequestID'][0]
        });

        if(SourceDEDataResult) {
          if(SourceDEDataResult.length == 2500) {
            for (var key1 in SourceDEDataResult) {
              DEListMap[key].DEDataMap.push(SourceDEDataResult[key1].Properties[0]); 
            }
            var tempLength = SourceDEDataResult.length;
            while(tempLength == 2500) {
              tempLength = await getMoreData(DEDataRequestId , key);
            }
            DEListSend[key] = {
              "DEName" : DEListMap[key].DEName,
              "DECustomerKey" : DEListMap[key].DECustomerKey,
              "FieldCount" : Object.keys(DEListMap[key].DEFieldMap).length,
              "RecordCount" : DEListMap[key].DEDataMap.length,
              "DEDescription" : DEListMap[key].DEDescription,
              "DEIsSendable" : DEListMap[key].DEIsSendable,
              "DEIsTestable" : DEListMap[key].DEIsTestable,
              "DESendDEField" : DEListMap[key].DESendDEField,
              "DESendSubsField" : DEListMap[key].DESendSubsField
            };
          }
          else {
            //console.log('Length : ' + SourceDEDataResult.length);
            //SourceDEDataResult = SourceDEDataResult.replace(/:/g, "");
            //SourceDEDataResult = xmlParser.toJson(SourceDEDataResult);
            //SourceDEDataResult = JSON.parse(SourceDEDataResult);
            //SourceDEDataResult = SourceDEDataResult.soapEnvelope.soapBody.RetrieveResponseMsg.Results;
            for (var key1 in SourceDEDataResult) {
              DEListMap[key].DEDataMap.push(SourceDEDataResult[key1].Properties[0]);
              
              //if (key1 != 'xsitype' && key1 != 'PartnerKey' && key1 != 'ObjectID' && key1 != 'Type' && key1 != 'Properties') {
                //DEListMap[key].DEDataMap.push(SourceDEDataResult[key1].Properties);
              //}
              //else if (key1 == 'Properties') {
                //DEListMap[key].DEDataMap.push(SourceDEDataResult["Properties"]);
              //}
            }
            DEListSend[key] = {
              "DEName" : DEListMap[key].DEName,
              "DECustomerKey" : DEListMap[key].DECustomerKey,
              "FieldCount" : Object.keys(DEListMap[key].DEFieldMap).length,
              "RecordCount" : DEListMap[key].DEDataMap.length,
              "DEDescription" : DEListMap[key].DEDescription,
              "DEIsSendable" : DEListMap[key].DEIsSendable,
              "DEIsTestable" : DEListMap[key].DEIsTestable,
              "DESendDEField" : DEListMap[key].DESendDEField,
              "DESendSubsField" : DEListMap[key].DESendSubsField
            };
            //console.log(key + ' : mera result : ' + JSON.stringify(DEListMap[key].DEDataMap));
          }
        }
        else {
          DEListSend[key] = {
            "DEName" : DEListMap[key].DEName,
            "DECustomerKey" : DEListMap[key].DECustomerKey,
            "FieldCount" : Object.keys(DEListMap[key].DEFieldMap).length,
            "RecordCount" : DEListMap[key].DEDataMap.length,
            "DEDescription" : DEListMap[key].DEDescription,
            "DEIsSendable" : DEListMap[key].DEIsSendable,
            "DEIsTestable" : DEListMap[key].DEIsTestable,
            "DESendDEField" : DEListMap[key].DESendDEField,
            "DESendSubsField" : DEListMap[key].DESendSubsField
          };
        }
        resolve(DEListMap[key].DEDataMap);
      });
  */



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

            if (tempDEInsertResult[0]["StatusMessage"] == "Updating an existing Data Extension definition is not allowed when doing an add-only operation. ") {
              FinalResult[key] = {
                "DEInsert": {
                  "Name": DEListMap[key].DEName,
                  "StatusCode": response.statusCode,
                  "StatusMessage": tempDEInsertResult[0]["StatusCode"][0],
                  "Description": "This Data extention Name or External Key is already exist in Destination SFMC Instance"
                },
                "DEDataInsert": {
                  "Name": "-",
                  "StatusCode": "-",
                  "StatusMessage": "-",
                  "Description": "-"
                }
              };
            }
            else {
              FinalResult[key] = {
                "DEInsert": {
                  "Name": DEListMap[key].DEName,
                  "StatusCode": response.statusCode,
                  "StatusMessage": tempDEInsertResult[0]["StatusCode"][0],
                  "Description": tempDEInsertResult[0]["StatusMessage"][0]
                },
                "DEDataInsert": {
                  "Name": "-",
                  "StatusCode": "-",
                  "StatusMessage": "-",
                  "Description": "-"
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
    return new Promise(async function (resolve, reject) {
      if (DEListMap[key].RecordCount != 0) {

        await getDEData(key);

        if (DEListMap[key].RecordCount <= 10000) {

          if (DEListMap[key].DEDataMap[0].keys) {
            var sliceStart = 0;
            var sliceEnd = DEListMap[key].RecordCount;
            recurFuncDERecInsertWithPrimaryKey(sliceStart , sliceEnd , DEListMap[key].DEDataMap);
            resolve(FinalResult);
          }
          else {
            var sliceStart = 0;
            var sliceEnd = DEListMap[key].RecordCount;
            recurFuncDERecInsertWithoutPrimaryKey(sliceStart , sliceEnd , DEListMap[key].DEDataMap);
            resolve(FinalResult);
          }
        }
        else {
          var loopLength = Math.ceil(DEListMap[key].RecordCount / 10000);
          for (var i = 1; i <= loopLength; i++) {

            if (DEListMap[key].DEDataMap[0].keys) {
              var sliceStart = 0;
              var sliceEnd = 10000;
              recurFuncDERecInsertWithPrimaryKey(sliceStart , sliceEnd , DEListMap[key].DEDataMap.splice(0,10000));
            }
            else {
              var sliceStart = 0;
              var sliceEnd = 10000;
              recurFuncDERecInsertWithoutPrimaryKey(sliceStart , sliceEnd , DEListMap[key].DEDataMap.splice(0,10000));
            }
          }
          resolve(FinalResult);
        }
      }
      else {
        FinalResult[key]["DEDataInsert"]["Name"] = DEListMap[key].DEName;
        FinalResult[key]["DEDataInsert"]["StatusCode"] = "200";
        FinalResult[key]["DEDataInsert"]["StatusMessage"] = "Success";
        FinalResult[key]["DEDataInsert"]["Description"] = "Record Count is 0";
        resolve(FinalResult);
      }





      async function recurFuncDERecInsertWithPrimaryKey(sliceStart , sliceEnd , ListToInsert) {
        if(JSON.stringify(ListToInsert.slice(sliceStart,sliceEnd+1)).length < 8300000) {
          FinalResult = await insertRecFuncWithPrimaryKey(JSON.stringify(ListToInsert.slice(sliceStart,sliceEnd+1)));
        }
        else {
          var SecontSliceEnd = sliceEnd
            sliceEnd = Math.ceil(sliceEnd/2);
            recurFuncDERecInsertWithPrimaryKey(sliceStart , sliceEnd , ListToInsert);

            sliceStart = sliceEnd + 1;
            recurFuncDERecInsertWithPrimaryKey(sliceStart , SecontSliceEnd , ListToInsert);
        }
      }
      async function recurFuncDERecInsertWithoutPrimaryKey(sliceStart , sliceEnd , ListToInsert) {
        if(JSON.stringify(ListToInsert.slice(sliceStart,sliceEnd+1)).length < 8300000) {
          FinalResult = await insertRecFuncWithoutPrimaryKey('{"items":' + JSON.stringify(ListToInsert.slice(sliceStart,sliceEnd+1)) + '}');
        }
        else {
          var SecontSliceEnd = sliceEnd
            sliceEnd = Math.ceil(sliceEnd/2);
            recurFuncDERecInsertWithoutPrimaryKey(sliceStart , sliceEnd , ListToInsert);

            sliceStart = sliceEnd + 1;
            recurFuncDERecInsertWithoutPrimaryKey(sliceStart , SecontSliceEnd , ListToInsert);
        }
      }

      async function insertRecFuncWithPrimaryKey(ProcessedBody) {
        return new Promise(function (resolve, reject) {

          var option = {
            'method': 'POST',
            'url': DestinationRestURL + 'hub/v1/dataevents/key:' + key + '/rowset',
            'headers': {
              'Authorization': 'Bearer ' + DestinationAccessToken,
              'Content-Type': 'application/json'
            },
            body: ProcessedBody
          };

          request(option, function (error, response) {
            if (error) throw new Error(error);
            var temp = response.body;
            //console.log('ProcessedBody response : ' + response.body);
            FinalResult[key]["DEDataInsert"]["Name"] = DEListMap[key].DEName;
            FinalResult[key]["DEDataInsert"]["StatusCode"] = response.statusCode;
            if (response.statusCode == 202 || response.statusCode == 200) {
              FinalResult[key]["DEDataInsert"]["StatusMessage"] = "ok";
              FinalResult[key]["DEDataInsert"]["Description"] = "Success";
            }
            else {
              FinalResult[key]["DEDataInsert"]["StatusMessage"] = temp.resultMessages;
              FinalResult[key]["DEDataInsert"]["Description"] = "-";
            }
            //console.log('FinalResult : ' + JSON.stringify(FinalResult));
            resolve(FinalResult);
          });
        })
      }
      async function insertRecFuncWithoutPrimaryKey(ProcessedBody) {
        return new Promise(function (resolve, reject) {
          var option = {
            'method': 'POST',
            'url': DestinationRestURL + 'data/v1/async/dataextensions/key:' + key + '/rows',
            'headers': {
              'Authorization': 'Bearer ' + DestinationAccessToken,
              'Content-Type': 'application/json'
            },
            body: ProcessedBody
          };
          request(option, function (error, response) {
            if (error) throw new Error(error);
            var temp = response.body;
            //console.log('ProcessedBody response : ' + response.body);
            FinalResult[key]["DEDataInsert"]["Name"] = DEListMap[key].DEName;
            FinalResult[key]["DEDataInsert"]["StatusCode"] = response.statusCode;
            if (response.statusCode == 202 || response.statusCode == 200) {
              FinalResult[key]["DEDataInsert"]["StatusMessage"] = "ok";
              FinalResult[key]["DEDataInsert"]["Description"] = "Success";
            }
            else {
              FinalResult[key]["DEDataInsert"]["StatusMessage"] = temp.resultMessages;
              FinalResult[key]["DEDataInsert"]["Description"] = "-";
            }
            //console.log('FinalResult : ' + JSON.stringify(FinalResult));
            resolve(FinalResult);
          });
        })
      }








      /*
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
                if(DEListMap[key].DEFieldMap[DEListMap[key].DEDataMap[key1].Property[key2].Name[0]]) {
                  if(DEListMap[key].DEFieldMap[DEListMap[key].DEDataMap[key1].Property[key2].Name[0]]["FieldIsPrimaryKey"] == "true") {
                    DEDataInsertWithPrimaryKeyBodyForKeys = DEDataInsertWithPrimaryKeyBodyForKeys + '"' + DEListMap[key].DEDataMap[key1].Property[key2].Name[0] +'":"' + DEListMap[key].DEDataMap[key1].Property[key2].Value[0] +'",';
                  }
                  else {
                    DEDataInsertWithPrimaryKeyBodyForValues = DEDataInsertWithPrimaryKeyBodyForValues + '"' + DEListMap[key].DEDataMap[key1].Property[key2].Name[0] +'":"' + DEListMap[key].DEDataMap[key1].Property[key2].Value[0] +'",';
                  }
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
      else {
        FinalResult[key]["DEDataInsert"]["Name"] = DEListMap[key].DEName;
        FinalResult[key]["DEDataInsert"]["StatusCode"] = "200";
        FinalResult[key]["DEDataInsert"]["StatusMessage"] = "Success";
        FinalResult[key]["DEDataInsert"]["Description"] = "Record Count is 0";
      }
      */


    })
  }





  app.post("/DEListShowAPI", async (req, res) => {
    if (req.body.reqForDEList = 'True') {
      DEListMap = await getSourceListOfDE();
      DEListMap = await getSourceDEFieldsAndData();
      //console.log('DEListMap Last : ' + JSON.stringify(DEListMap));
      //DEListSend from getSourceDEFieldsAndData
      res.send(DEListSend);
    }
  });

  app.post("/SelectedDEListInsert", async (req, res) => {
    if (req.body.reqForSelectedDEList) {
      selectedDEList = req.body.reqForSelectedDEList;

      var count = 0;
      for (var key in selectedDEList.WithoutData) {
        FinalDEInsert(key);
      }

      var sendEmail = setInterval(function () {
        count = 0;
        for(var x in selectedDEList.WithoutData) {
          if(x in FinalResult) {
            if(FinalResult[x].DEInsert.Name) {
              if(x in selectedDEList.WithData) {
                if(FinalResult[x].DEDataInsert.Name != '-') {
                  count = count + 1;
                }
              }
              else {
                count = count + 1;
              }
            }
          }
        }
        if(count == Object.keys(selectedDEList.WithoutData).length) {
          console.log('final h : ' + JSON.stringify(FinalResult));


          let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              type: 'OAuth2',
              user: 'faizal@cyntexa.com',
              pass: 'apnadaalo',
              clientId: '644945586686-g3b5ngtt4l003k0mu9onl5nsa49i47lv.apps.googleusercontent.com',
              clientSecret: '9XBsZSm03RQQ35CoG21HjjVB',
              refreshToken: '1//04kGmfZNUxqqGCgYIARAAGAQSNwF-L9IrpQWtLGAfIiYYq_UZJikNQ1FSS7vCxjhf2HbW1FfTVDLUbaZZEShJgl9H-VXPEW3_UTU'
            }
          });
          let mailOptions = {
            from: 'faizal@cyntexa.com',
            to: req.body.UserEmailAddress,
            subject: 'Data Extention Migration Report Mail',
            html: '<h5>Hi from your nodemailer project : </h5><br><br>' + JSON.stringify(FinalResult)
          };
          transporter.sendMail(mailOptions, function(err, data) {
            if (err) {
              console.log("Error " + err);
            } else {
              console.log("Email sent successfully");
            }
          });



          clearInterval(sendEmail);
        }
      }, 2000);
      

      
      async function FinalDEInsert(key) {
        let delay = 1000;
        var bool = false;
        var bool1 = false;
        let timerId = setTimeout(async function request() {
          if (bool == false) {
            delay *= 24*60*60;
            bool1 = true;
            timerId = setTimeout(request, delay);
          }
          if (bool1 == true) {
            bool = true;

            //for (var key in selectedDEList.WithoutData) {
              //FinalResult = await 
              await insertDEtoDestination(key);
              if(selectedDEList.WithData) {
                if(key in selectedDEList.WithData) {
                  //FinalResult = await 
                  await insertDEDataToDestination(key);
                }
              }
            //}

            clearTimeout(timerId);
            count = count + 1;
          }
        }, delay);
      }

      //console.log('FinalResult : ' + JSON.stringify(FinalResult));
    }
    res.send(FinalResult);
    FinalResult = {};
  });










  async function getSourceListOfSharedDE() {
    return new Promise(function (resolve, reject) {
      authTokenForBothSFDC();
      var SharedDEFolder;
      var SharedDEFolderOption = {
        'method': 'POST',
        'url': SourceSoapURL + 'Service.asmx',
        'headers': {
          'Content-Type': 'text/xml',
          'SoapAction': 'Retrieve',
          'Authorization': 'Bearer ' + SourceAccessToken
        },
        body: '<?xml version="1.0" encoding="UTF-8"?>\r\n<s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope" xmlns:a="http://schemas.xmlsoap.org/ws/2004/08/addressing" xmlns:u="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">\r\n    <s:Header>\r\n        <a:Action s:mustUnderstand="1">Retrieve</a:Action>\r\n        <a:MessageID>urn:uuid:7e0cca04-57bd-4481-864c-6ea8039d2ea0</a:MessageID>\r\n        <a:ReplyTo>\r\n            <a:Address>http://schemas.xmlsoap.org/ws/2004/08/addressing/role/anonymous</a:Address>\r\n        </a:ReplyTo>\r\n        <a:To s:mustUnderstand="1">' + SourceSoapURL + 'Service.asmx</a:To>\r\n        <fueloauth xmlns="http://exacttarget.com">' + SourceAccessToken + '</fueloauth>\r\n    </s:Header>\r\n    <s:Body xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">\r\n        <RetrieveRequestMsg xmlns="http://exacttarget.com/wsdl/partnerAPI">\r\n            <RetrieveRequest>\r\n                <ObjectType>DataFolder</ObjectType>\r\n                <Properties>ID</Properties>\r\n                <Properties>Name</Properties>\r\n                <Properties>ContentType</Properties>\r\n                <Properties>ParentFolder.Name</Properties>\r\n                <Properties>ObjectID</Properties>\r\n                <Properties>ParentFolder.ObjectID</Properties>\r\n\r\n                <ns1:Filter\r\n                     xmlns:ns1="http://exacttarget.com/wsdl/partnerAPI" xsi:type="ns1:SimpleFilterPart">\r\n                     <ns1:Property>ContentType</ns1:Property>\r\n                     <ns1:SimpleOperator>equals</ns1:SimpleOperator>\r\n                     <ns1:Value>shared_dataextension</ns1:Value>\r\n                </ns1:Filter>\r\n\r\n                <QueryAllAccounts>true</QueryAllAccounts>\r\n            </RetrieveRequest>\r\n      </RetrieveRequestMsg>\r\n   </s:Body>\r\n</s:Envelope>'
      };
      request(SharedDEFolderOption, function (error, response) {
        if (error) throw new Error(error);
        xml2jsParser.parseString(response.body, function (err, result) {
          SharedDEFolder = result['soap:Envelope']['soap:Body'][0]['RetrieveResponseMsg'][0]['Results'];
        });
        var CategoryIDList = [];
        for (var key in SharedDEFolder) {
          CategoryIDList.push(SharedDEFolder[key].ID[0]);
        }
        var ListShareDEBody = '<?xml version="1.0" encoding="UTF-8"?>' +
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
          '<ObjectType>DataExtension</ObjectType>' +
          '<QueryAllAccounts>true</QueryAllAccounts>' +
          '<QueryAllAccountsSpecified>true</QueryAllAccountsSpecified>' +
          '<Properties>CustomerKey</Properties>' +
          '<Properties>Name</Properties>' +
          '<Properties>DataExtension.ObjectID</Properties>' +
          '<Properties>IsSendable</Properties>' +
          '<Properties>IsTestable</Properties>' +
          '<Properties>SendableSubscriberField.Name</Properties>' +
          '<Properties>SendableDataExtensionField.Name</Properties>' +
          '<Properties>Description</Properties>' +
          '<Properties>CategoryID</Properties>' +
          '<Properties>Client.ID</Properties>' +
          '<Filter xsi:type="SimpleFilterPart">' +
          '<Property>CategoryID</Property>';
        if (CategoryIDList.length == 1) {
          ListShareDEBody = ListShareDEBody + '<SimpleOperator>equals</SimpleOperator> <Value>' + CategoryIDList[0] + '</Value>';
        }
        else {
          ListShareDEBody = ListShareDEBody + '<SimpleOperator>IN</SimpleOperator>';
          for (var i = 0; i < CategoryIDList.length; i++) {
            ListShareDEBody = ListShareDEBody + '<Value>' + CategoryIDList[i] + '</Value>';
          }
        }
        ListShareDEBody = ListShareDEBody + '</Filter>' +
          '</RetrieveRequest>' +
          '</RetrieveRequestMsg>' +
          '</s:Body>' +
          '</s:Envelope>';
        var ListSharedDEOption = {
          'method': 'POST',
          'url': SourceSoapURL + 'Service.asmx',
          'headers': {
            'Content-Type': 'text/xml',
            'SoapAction': 'Retrieve',
            'Authorization': 'Bearer ' + SourceAccessToken
          },
          body: ListShareDEBody
        };
        request(ListSharedDEOption, function (error, response) {
          if (error) throw new Error(error);
          xml2jsParser.parseString(response.body, function (err, result) {
            SourceListSharedDEResult = result['soap:Envelope']['soap:Body'][0]['RetrieveResponseMsg'][0]['Results'];
          });
          for (var key in SourceListSharedDEResult) {
            if (SourceListSharedDEResult[key].IsSendable[0] == "true") {
              SharedDEListMap[SourceListSharedDEResult[key].CustomerKey] = {
                "DEName": SourceListSharedDEResult[key].Name[0],
                "DECustomerKey": SourceListSharedDEResult[key].CustomerKey[0],
                "DEIsSendable": SourceListSharedDEResult[key].IsSendable[0],
                "DEIsTestable": SourceListSharedDEResult[key].IsTestable[0],
                "DEDescription": SourceListSharedDEResult[key].Description[0],
                "DESendDEField": SourceListSharedDEResult[key].SendableDataExtensionField[0].Name[0],
                "DESendSubsField": SourceListSharedDEResult[key].SendableSubscriberField[0].Name[0],
                "RecordCount": 0,
                "DEFieldMap": {},
                "DEDataMap": []
              };
            }
            else {
              SharedDEListMap[SourceListSharedDEResult[key].CustomerKey[0]] = {
                "DEName": SourceListSharedDEResult[key].Name[0],
                "DECustomerKey": SourceListSharedDEResult[key].CustomerKey[0],
                "DEIsSendable": SourceListSharedDEResult[key].IsSendable[0],
                "DEIsTestable": SourceListSharedDEResult[key].IsTestable[0],
                "DEDescription": SourceListSharedDEResult[key].Description[0],
                "DESendDEField": '',
                "DESendSubsField": '',
                "RecordCount": 0,
                "DEFieldMap": {},
                "DEDataMap": []
              };
            }
          }
          resolve(SharedDEListMap);
        });
      });
    })
  }

  async function getSourceSharedDEFieldsAndData() {
    return new Promise(async function (resolve, reject) {
      authTokenForBothSFDC();
      var ShareDEFieldsBody = '<?xml version="1.0" encoding="UTF-8"?>' +
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
        '<Property>DataExtension.CustomerKey</Property>';
      var tempcheck = true;
      for (var key in SharedDEListMap) {
        if (SharedDEListMap.size == 1) {
          ShareDEFieldsBody = ShareDEFieldsBody + '<SimpleOperator>equals</SimpleOperator> <Value>' + key + '</Value>';
          break;
        }
        else {
          if (tempcheck == true) {
            ShareDEFieldsBody = ShareDEFieldsBody + '<SimpleOperator>IN</SimpleOperator>';
            tempcheck = false;
          }
          ShareDEFieldsBody = ShareDEFieldsBody + '<Value>' + key + '</Value>';
        }
      }
      ShareDEFieldsBody = ShareDEFieldsBody + '</Filter>' +
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
      var SharedDEFieldOption = {
        'method': 'POST',
        'url': SourceSoapURL + 'Service.asmx',
        'headers': {
          'Content-Type': 'text/xml',
          'SoapAction': 'Retrieve',
          'Authorization': 'Bearer ' + SourceAccessToken
        },
        body: ShareDEFieldsBody
      };
      request(SharedDEFieldOption, async function (error, response) {
        if (error) throw new Error(error);
        SourceSharedDEFieldsResult = response.body;
        xml2jsParser.parseString(SourceSharedDEFieldsResult, function (err, result) {
          SourceSharedDEFieldsResult = result['soap:Envelope']['soap:Body'][0]['RetrieveResponseMsg'][0]['Results'];
        });
        for (var key in SourceSharedDEFieldsResult) {
          if (SourceSharedDEFieldsResult[key].DataExtension[0].CustomerKey[0] in SharedDEListMap) {
            if ("MaxLength" in SourceSharedDEFieldsResult[key] && "Scale" in SourceSharedDEFieldsResult[key]) {
              SharedDEListMap[SourceSharedDEFieldsResult[key].DataExtension[0].CustomerKey[0]].DEFieldMap[SourceSharedDEFieldsResult[key].Name[0]] = {
                "FieldName": SourceSharedDEFieldsResult[key].Name[0],
                "FieldIsRequired": SourceSharedDEFieldsResult[key].IsRequired[0],
                "FieldIsPrimaryKey": SourceSharedDEFieldsResult[key].IsPrimaryKey[0],
                "FieldFieldType": SourceSharedDEFieldsResult[key].FieldType[0],
                "FieldMaxLength": SourceSharedDEFieldsResult[key].MaxLength[0],
                "FieldScale": SourceSharedDEFieldsResult[key].Scale[0],
                "FieldDefaultValue": SourceSharedDEFieldsResult[key].DefaultValue[0]
              };
            }
            else if ("MaxLength" in SourceSharedDEFieldsResult[key] && ("Scale" in SourceSharedDEFieldsResult[key]) == false) {
              SharedDEListMap[SourceSharedDEFieldsResult[key].DataExtension[0].CustomerKey[0]].DEFieldMap[SourceSharedDEFieldsResult[key].Name[0]] = {
                "FieldName": SourceSharedDEFieldsResult[key].Name[0],
                "FieldIsRequired": SourceSharedDEFieldsResult[key].IsRequired[0],
                "FieldIsPrimaryKey": SourceSharedDEFieldsResult[key].IsPrimaryKey[0],
                "FieldFieldType": SourceSharedDEFieldsResult[key].FieldType[0],
                "FieldMaxLength": SourceSharedDEFieldsResult[key].MaxLength[0],
                "FieldScale": "",
                "FieldDefaultValue": SourceSharedDEFieldsResult[key].DefaultValue[0]
              };
            }
            else if (("MaxLength" in SourceSharedDEFieldsResult[key]) == false && "Scale" in SourceSharedDEFieldsResult[key]) {
              SharedDEListMap[SourceSharedDEFieldsResult[key].DataExtension[0].CustomerKey[0]].DEFieldMap[SourceSharedDEFieldsResult[key].Name[0]] = {
                "FieldName": SourceSharedDEFieldsResult[key].Name[0],
                "FieldIsRequired": SourceSharedDEFieldsResult[key].IsRequired[0],
                "FieldIsPrimaryKey": SourceSharedDEFieldsResult[key].IsPrimaryKey[0],
                "FieldFieldType": SourceSharedDEFieldsResult[key].FieldType[0],
                "FieldMaxLength": "",
                "FieldScale": SourceSharedDEFieldsResult[key].Scale[0],
                "FieldDefaultValue": SourceSharedDEFieldsResult[key].DefaultValue[0]
              };
            }
            else {
              SharedDEListMap[SourceSharedDEFieldsResult[key].DataExtension[0].CustomerKey[0]].DEFieldMap[SourceSharedDEFieldsResult[key].Name[0]] = {
                "FieldName": SourceSharedDEFieldsResult[key].Name[0],
                "FieldIsRequired": SourceSharedDEFieldsResult[key].IsRequired[0],
                "FieldIsPrimaryKey": SourceSharedDEFieldsResult[key].IsPrimaryKey[0],
                "FieldFieldType": SourceSharedDEFieldsResult[key].FieldType[0],
                "FieldMaxLength": "",
                "FieldScale": "",
                "FieldDefaultValue": SourceSharedDEFieldsResult[key].DefaultValue[0]
              };
            }
          }
        }
        for (var key in SharedDEListMap) {
          await getSharedDERecordCount(key);
        }
        resolve(SharedDEListMap);
      });
    })
  }

  async function getSharedDERecordCount(key) {
    return new Promise(async function (resolve, reject) {
      var SharedDEDataOptions = {
        'method': 'GET',
        'url': SourceRestURL + 'data/v1/customobjectdata/key/' + key + '/rowset/?$page=1&$pagesize=1',
        'headers': {
          'Authorization': 'Bearer ' + SourceAccessToken
        }
      };
      request(SharedDEDataOptions, async function (error, response) {
        if (error) throw new Error(error);
        var tempResult = JSON.parse(response.body);
        SharedDEListMap[key].RecordCount = tempResult.count;
        SharedDEListSend[key] = {
          "DEName": SharedDEListMap[key].DEName,
          "DECustomerKey": SharedDEListMap[key].DECustomerKey,
          "FieldCount": Object.keys(SharedDEListMap[key].DEFieldMap).length,
          "RecordCount": tempResult.count,
          "DEDescription": SharedDEListMap[key].DEDescription,
          "DEIsSendable": SharedDEListMap[key].DEIsSendable,
          "DEIsTestable": SharedDEListMap[key].DEIsTestable,
          "DESendDEField": SharedDEListMap[key].DESendDEField,
          "DESendSubsField": SharedDEListMap[key].DESendSubsField
        };
        resolve(SharedDEListSend);
      });
    })
  }








  async function getSharedDEData(key) {
    return new Promise(async function (resolve, reject) {
      var NextUrl;
      var SharedDEDataOptions = {
        'method': 'GET',
        'url': SourceRestURL + 'data/v1/customobjectdata/key/' + key + '/rowset/',
        'headers': {
          'Authorization': 'Bearer ' + SourceAccessToken
        }
      };
      request(SharedDEDataOptions, async function (error, response) {
        if (error) throw new Error(error);
        var tempResult = JSON.parse(response.body);

        if(tempResult.count != 0) {
          if(Object.keys(tempResult.items[0].keys).length != 0) {
            SharedDEListMap[key].DEDataMap.push.apply(SharedDEListMap[key].DEDataMap, tempResult.items);
          }
          else {
            for(var i in tempResult.items) {
              SharedDEListMap[key].DEDataMap.push(tempResult.items[i].values);
            }
          }
        }

        //console.log('Records aaye : ' + JSON.stringify(SharedDEListMap[key].DEDataMap));
        var looplength = Math.ceil(tempResult.count / tempResult.pageSize);
        if (looplength >= 2) {
          NextUrl = tempResult.links.next;
          for (var i = 2; i <= looplength; i++) {
            NextUrl = await getMoreSharedDEData(NextUrl, key);
          }
        }
        resolve(SharedDEListMap);
      });
    })
  }

  async function getMoreSharedDEData(NextUrl, key) {
    return new Promise(async function (resolve, reject) {
      var SharedDEMoreDataOptions = {
        'method': 'GET',
        'url': SourceRestURL + 'data' + NextUrl,
        'headers': {
          'Authorization': 'Bearer ' + SourceAccessToken
        }
      };
      request(SharedDEMoreDataOptions, function (error, response) {
        if (error) throw new Error(error);
        var tempResult1 = JSON.parse(response.body);

        if(tempResult1.count != 0) {
          if(Object.keys(tempResult1.items[0].keys).length != 0) {
            SharedDEListMap[key].DEDataMap.push.apply(SharedDEListMap[key].DEDataMap, tempResult1.items);
          }
          else {
            for(var i in tempResult1.items) {
              SharedDEListMap[key].DEDataMap.push(tempResult1.items[i].values);
            }
          }
        }

        NextUrl = tempResult1.links.next;
        resolve(NextUrl);
      })
    })
  }





  async function insertSharedDEtoDestination(key) {
    return new Promise(function (resolve, reject) {
      var DEListBody = '';
      if (key in SharedDEListMap) {
        DEListBody = '<?xml version="1.0" encoding="UTF-8"?>' +
          '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">' +
          '<soapenv:Header>' +
          '<fueloauth>' + DestinationAccessToken + '</fueloauth>' +
          '</soapenv:Header>' +
          '<soapenv:Body>' +
          '<CreateRequest xmlns="http://exacttarget.com/wsdl/partnerAPI">' +
          '<Options/>' +
          '<Objects xsi:type="ns2:DataExtension" xmlns:ns2="http://exacttarget.com/wsdl/partnerAPI">' +
          '<CustomerKey>' + selectedDEList.WithoutData[key].DEExtKey + 'test</CustomerKey>' +
          '<Name>' + selectedDEList.WithoutData[key].DEName + 'test</Name>' +
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
        for (var i in SharedDEListMap[key].DEFieldMap) {
          if (SharedDEListMap[key].DEFieldMap[i].FieldFieldType == 'Number' || SharedDEListMap[key].DEFieldMap[i].FieldFieldType == 'Date' || SharedDEListMap[key].DEFieldMap[i].FieldFieldType == 'Boolean') {
            if (JSON.stringify(SharedDEListMap[key].DEFieldMap[i].FieldDefaultValue) == '{}') {
              tempDefaultValue = '';
            }
            else {
              tempDefaultValue = SharedDEListMap[key].DEFieldMap[i].FieldDefaultValue;
            }
            DEListBody = DEListBody + '<Field xsi:type="ns2:DataExtensionField">' +
              '<CustomerKey>' + SharedDEListMap[key].DEFieldMap[i].FieldName + '</CustomerKey>' +
              '<Name>' + SharedDEListMap[key].DEFieldMap[i].FieldName + '</Name>' +
              '<Label>' + SharedDEListMap[key].DEFieldMap[i].FieldName + '</Label>' +
              '<IsRequired>' + SharedDEListMap[key].DEFieldMap[i].FieldIsRequired + '</IsRequired>' +
              '<IsPrimaryKey>' + SharedDEListMap[key].DEFieldMap[i].FieldIsPrimaryKey + '</IsPrimaryKey>' +
              '<FieldType>' + SharedDEListMap[key].DEFieldMap[i].FieldFieldType + '</FieldType>' +
              '<DefaultValue>' + tempDefaultValue + '</DefaultValue>' +
              '</Field>';
          }
          else if (SharedDEListMap[key].DEFieldMap[i].FieldFieldType == 'EmailAddress') {
            DEListBody = DEListBody + '<Field xsi:type="ns2:DataExtensionField">' +
              '<CustomerKey>' + SharedDEListMap[key].DEFieldMap[i].FieldName + '</CustomerKey>' +
              '<Name>' + SharedDEListMap[key].DEFieldMap[i].FieldName + '</Name>' +
              '<Label>' + SharedDEListMap[key].DEFieldMap[i].FieldName + '</Label>' +
              '<IsRequired>' + SharedDEListMap[key].DEFieldMap[i].FieldIsRequired + '</IsRequired>' +
              '<IsPrimaryKey>' + SharedDEListMap[key].DEFieldMap[i].FieldIsPrimaryKey + '</IsPrimaryKey>' +
              '<FieldType>' + SharedDEListMap[key].DEFieldMap[i].FieldFieldType + '</FieldType>' +
              '<MaxLength>254</MaxLength>' +
              '</Field>';
          }
          else if (SharedDEListMap[key].DEFieldMap[i].FieldFieldType == 'Phone') {
            DEListBody = DEListBody + '<Field xsi:type="ns2:DataExtensionField">' +
              '<CustomerKey>' + SharedDEListMap[key].DEFieldMap[i].FieldName + '</CustomerKey>' +
              '<Name>' + SharedDEListMap[key].DEFieldMap[i].FieldName + '</Name>' +
              '<Label>' + SharedDEListMap[key].DEFieldMap[i].FieldName + '</Label>' +
              '<IsRequired>' + SharedDEListMap[key].DEFieldMap[i].FieldIsRequired + '</IsRequired>' +
              '<IsPrimaryKey>' + SharedDEListMap[key].DEFieldMap[i].FieldIsPrimaryKey + '</IsPrimaryKey>' +
              '<FieldType>' + SharedDEListMap[key].DEFieldMap[i].FieldFieldType + '</FieldType>' +
              '<MaxLength>50</MaxLength>' +
              '</Field>';
          }
          else if (SharedDEListMap[key].DEFieldMap[i].FieldFieldType == 'Decimal') {
            if (JSON.stringify(SharedDEListMap[key].DEFieldMap[i].FieldDefaultValue) == '{}') {
              tempDefaultValue = '';
            }
            else {
              tempDefaultValue = SharedDEListMap[key].DEFieldMap[i].FieldDefaultValue;
            }


            if (SharedDEListMap[key].DEFieldMap[i].FieldMaxLength) {
              tempMaxLength = SharedDEListMap[key].DEFieldMap[i].FieldMaxLength;
            }
            else {
              tempMaxLength = 100;
            }

            DEListBody = DEListBody + '<Field xsi:type="ns2:DataExtensionField">' +
              '<CustomerKey>' + SharedDEListMap[key].DEFieldMap[i].FieldName + '</CustomerKey>' +
              '<Name>' + SharedDEListMap[key].DEFieldMap[i].FieldName + '</Name>' +
              '<Label>' + SharedDEListMap[key].DEFieldMap[i].FieldName + '</Label>' +
              '<IsRequired>' + SharedDEListMap[key].DEFieldMap[i].FieldIsRequired + '</IsRequired>' +
              '<IsPrimaryKey>' + SharedDEListMap[key].DEFieldMap[i].FieldIsPrimaryKey + '</IsPrimaryKey>' +
              '<FieldType>' + SharedDEListMap[key].DEFieldMap[i].FieldFieldType + '</FieldType>' +
              '<MaxLength>' + tempMaxLength + '</MaxLength>' +
              '<Scale>' + SharedDEListMap[key].DEFieldMap[i].FieldScale + '</Scale>' +
              '<DefaultValue>' + tempDefaultValue + '</DefaultValue>' +
              '</Field>';
          }
          else if (SharedDEListMap[key].DEFieldMap[i].FieldFieldType == 'Locale') {
            DEListBody = DEListBody + '<Field xsi:type="ns2:DataExtensionField">' +
              '<CustomerKey>' + SharedDEListMap[key].DEFieldMap[i].FieldName + '</CustomerKey>' +
              '<Name>' + SharedDEListMap[key].DEFieldMap[i].FieldName + '</Name>' +
              '<Label>' + SharedDEListMap[key].DEFieldMap[i].FieldName + '</Label>' +
              '<IsRequired>' + SharedDEListMap[key].DEFieldMap[i].FieldIsRequired + '</IsRequired>' +
              '<IsPrimaryKey>' + SharedDEListMap[key].DEFieldMap[i].FieldIsPrimaryKey + '</IsPrimaryKey>' +
              '<FieldType>' + SharedDEListMap[key].DEFieldMap[i].FieldFieldType + '</FieldType>' +
              '<MaxLength>5</MaxLength>' +
              '</Field>';
          }
          else if (SharedDEListMap[key].DEFieldMap[i].FieldFieldType == 'Text') {
            if (JSON.stringify(SharedDEListMap[key].DEFieldMap[i].FieldDefaultValue) == '{}') {
              tempDefaultValue = '';
            }
            else {
              tempDefaultValue = SharedDEListMap[key].DEFieldMap[i].FieldDefaultValue;
            }

            if (SharedDEListMap[key].DEFieldMap[i].FieldMaxLength) {
              tempMaxLength = SharedDEListMap[key].DEFieldMap[i].FieldMaxLength;
            }
            else {
              tempMaxLength = 100;
            }

            DEListBody = DEListBody + '<Field xsi:type="ns2:DataExtensionField">' +
              '<CustomerKey>' + SharedDEListMap[key].DEFieldMap[i].FieldName + '</CustomerKey>' +
              '<Name>' + SharedDEListMap[key].DEFieldMap[i].FieldName + '</Name>' +
              '<Label>' + SharedDEListMap[key].DEFieldMap[i].FieldName + '</Label>' +
              '<IsRequired>' + SharedDEListMap[key].DEFieldMap[i].FieldIsRequired + '</IsRequired>' +
              '<IsPrimaryKey>' + SharedDEListMap[key].DEFieldMap[i].FieldIsPrimaryKey + '</IsPrimaryKey>' +
              '<FieldType>' + SharedDEListMap[key].DEFieldMap[i].FieldFieldType + '</FieldType>' +
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

            if (tempDEInsertResult[0]["StatusMessage"] == "Updating an existing Data Extension definition is not allowed when doing an add-only operation. ") {
              FinalResult[key] = {
                "DEInsert": {
                  "Name": SharedDEListMap[key].DEName,
                  "StatusCode": response.statusCode,
                  "StatusMessage": tempDEInsertResult[0]["StatusCode"][0],
                  "Description": "This Data extention Name or External Key is already exist in Destination SFMC Instance"
                },
                "DEDataInsert": {
                  "Name": "-",
                  "StatusCode": "-",
                  "StatusMessage": "-",
                  "Description": "-"
                }
              };
            }
            else {
              FinalResult[key] = {
                "DEInsert": {
                  "Name": SharedDEListMap[key].DEName,
                  "StatusCode": response.statusCode,
                  "StatusMessage": tempDEInsertResult[0]["StatusCode"][0],
                  "Description": tempDEInsertResult[0]["StatusMessage"][0]
                },
                "DEDataInsert": {
                  "Name": "-",
                  "StatusCode": "-",
                  "StatusMessage": "-",
                  "Description": "-"
                }
              };
            }

            resolve(FinalResult);
          });
        }
      }
    })
  }

  async function insertSharedDEDataToDestination(key) {
    return new Promise(async function (resolve, reject) {
      if (SharedDEListMap[key].RecordCount != 0) {
        await getSharedDEData(key);
        if (SharedDEListMap[key].RecordCount <= 10000) {
          if (SharedDEListMap[key].DEDataMap[0].keys) {
            //var sliceStart = 0;
            //var sliceEnd = SharedDEListMap[key].RecordCount;
            recurFuncSharedDERecInsertWithExtKey(0 , SharedDEListMap[key].RecordCount , SharedDEListMap[key].DEDataMap);
            resolve(FinalResult);
          }
          else {
            //var sliceStart = 0;
            //var sliceEnd = SharedDEListMap[key].RecordCount;
            recurFuncSharedDERecInsertWithoutExtKey(0 , SharedDEListMap[key].RecordCount , SharedDEListMap[key].DEDataMap);
            resolve(FinalResult);
          }
        }
        else {
          var loopLength = Math.ceil(SharedDEListMap[key].RecordCount / 10000);
          for (var i = 1; i <= loopLength; i++) {
            if (SharedDEListMap[key].DEDataMap[0].keys) {
              //var sliceStart = 0;
              //var sliceEnd = 10000;
              recurFuncSharedDERecInsertWithExtKey(0 , 10000 , SharedDEListMap[key].DEDataMap.splice(0,10000));
            }
            else {
              //var sliceStart = 0;
              //var sliceEnd = 10000;
              recurFuncSharedDERecInsertWithoutExtKey(0 , 10000 , SharedDEListMap[key].DEDataMap.splice(0,10000));
            }
          }
          resolve(FinalResult);
        }
      }
      else {
        FinalResult[key]["DEDataInsert"]["Name"] = SharedDEListMap[key].DEName;
        FinalResult[key]["DEDataInsert"]["StatusCode"] = "200";
        FinalResult[key]["DEDataInsert"]["StatusMessage"] = "Success";
        FinalResult[key]["DEDataInsert"]["Description"] = "Record Count is 0";
        resolve(FinalResult);
      }


      async function recurFuncSharedDERecInsertWithExtKey(sliceStart , sliceEnd , ListToInsert) {
        if(JSON.stringify(ListToInsert.slice(sliceStart,sliceEnd+1)).length < 8300000) {
          FinalResult = await insertSharedDERecFuncWithExtKey(JSON.stringify(ListToInsert.slice(sliceStart,sliceEnd+1)));
        }
        else {
          var SecontSliceEnd = sliceEnd
          sliceEnd = Math.ceil(sliceEnd/2);
          recurFuncSharedDERecInsertWithExtKey(sliceStart , sliceEnd , ListToInsert);

          sliceStart = sliceEnd + 1;
          recurFuncSharedDERecInsertWithExtKey(sliceStart , SecontSliceEnd , ListToInsert);
        }
      }
      async function recurFuncSharedDERecInsertWithoutExtKey(sliceStart , sliceEnd , ListToInsert) {
        if(JSON.stringify(ListToInsert.slice(sliceStart,sliceEnd+1)).length < 8300000) {
          FinalResult = await insertSharedDERecFuncWithoutExtKey('{"items":'+ JSON.stringify(ListToInsert.slice(sliceStart,sliceEnd+1)) + '}');
        }
        else {
          var SecontSliceEnd = sliceEnd;
            sliceEnd = Math.ceil(sliceEnd/2);
            recurFuncSharedDERecInsertWithoutExtKey(sliceStart , sliceEnd , ListToInsert);

            sliceStart = sliceEnd + 1;
            recurFuncSharedDERecInsertWithoutExtKey(sliceStart , SecontSliceEnd , ListToInsert);
        }
      }

      async function insertSharedDERecFuncWithExtKey(ProcessedBody) {
        return new Promise(function (resolve, reject) {

          var Option = {
            'method': 'POST',
            'url': DestinationRestURL + 'hub/v1/dataevents/key:' + key + 'test/rowset',
            'headers': {
              'Authorization': 'Bearer ' + DestinationAccessToken,
              'Content-Type': 'application/json'
            },
            body: ProcessedBody
          };

          request(Option, function (error, response) {
            if (error) throw new Error(error);
            var temp = response.body;
            FinalResult[key]["DEDataInsert"]["Name"] = SharedDEListMap[key].DEName;
            FinalResult[key]["DEDataInsert"]["StatusCode"] = response.statusCode;
            if (response.statusCode == 202 || response.statusCode == 200) {
              FinalResult[key]["DEDataInsert"]["StatusMessage"] = "ok";
              FinalResult[key]["DEDataInsert"]["Description"] = "Success";
            }
            else {
              FinalResult[key]["DEDataInsert"]["StatusMessage"] = temp.resultMessages;
              FinalResult[key]["DEDataInsert"]["Description"] = "-";
            }
            resolve(FinalResult);
          });
        })
      }
      async function insertSharedDERecFuncWithoutExtKey(ProcessedBody) {
        return new Promise(function (resolve, reject) {
          var Option = {
            'method': 'POST',
            'url': DestinationRestURL + 'data/v1/async/dataextensions/key:' + key + 'test/rows',
            'headers': {
              'Authorization': 'Bearer ' + DestinationAccessToken,
              'Content-Type': 'application/json'
            },
            body: ProcessedBody
          };
          request(Option, function (error, response) {
            if (error) throw new Error(error);
            var temp = response.body;
            FinalResult[key]["DEDataInsert"]["Name"] = SharedDEListMap[key].DEName;
            FinalResult[key]["DEDataInsert"]["StatusCode"] = response.statusCode;
            if (response.statusCode == 202 || response.statusCode == 200) {
              FinalResult[key]["DEDataInsert"]["StatusMessage"] = "ok";
              FinalResult[key]["DEDataInsert"]["Description"] = "Success";
            }
            else {
              FinalResult[key]["DEDataInsert"]["StatusMessage"] = temp.resultMessages;
              FinalResult[key]["DEDataInsert"]["Description"] = "-";
            }
            resolve(FinalResult);
          });
        })
      }


    })
  }






//this function is only for test but it have so imp logics
  async function Test_insertSharedDEDataToDestination(key) {
    return new Promise(async function (resolve, reject) {
      if (SharedDEListMap[key].RecordCount != 0) {

        await getSharedDEData(key);

        if (SharedDEListMap[key].RecordCount <= 10000) {







          if (Object.keys(SharedDEListMap[key].DEDataMap[0].keys).length != 0) {
            FinalResult = await insertSharedDERecFuncWithExtKey(JSON.stringify(SharedDEListMap[key].DEDataMap));
            resolve(FinalResult);
          }
          else {
            var DEDataInsertWithoutPrimaryKeyBody = '';
            for (var key1 in SharedDEListMap[key].DEDataMap) {
              DEDataInsertWithoutPrimaryKeyBody = DEDataInsertWithoutPrimaryKeyBody + JSON.stringify(SharedDEListMap[key].DEDataMap[key1]["values"]) + ',';
            }
            DEDataInsertWithoutPrimaryKeyBody = DEDataInsertWithoutPrimaryKeyBody.slice(0, -1);
            DEDataInsertWithoutPrimaryKeyBody = '{"items":[' + DEDataInsertWithoutPrimaryKeyBody + ']}';

            
            FinalResult = await insertSharedDERecFuncWithoutExtKey(DEDataInsertWithoutPrimaryKeyBody);
            resolve(FinalResult);
          }






        }
        else {
          var loopLength = Math.ceil(SharedDEListMap[key].RecordCount / 10000);
          var recLengthSlice = SharedDEListMap[key].RecordCount / 10000;
          var ttemp = recLengthSlice.toString().split(".")[1];
          if (!ttemp) {
            ttemp = 0;
          }
          var recLenDecimal = parseInt(ttemp, 10);
          for (var i = 1; i <= loopLength; i++) {






            if (Object.keys(SharedDEListMap[key].DEDataMap[0].keys).length != 0) {
              var body = '';

              /*
              if (recLenDecimal != 0) {
                if (i == loopLength) {
                  for (var a = (i * 10000 - 9999); a <= SharedDEListMap[key].RecordCount; a++) {
                    body = body + JSON.stringify(SharedDEListMap[key].DEDataMap[a - 1]) + ',';
                  }
                  body = body.slice(0, -1);
                }
                else {
                  for (var b = (i * 10000 - 9999); b <= (i * 10000); b++) {
                    body = body + JSON.stringify(SharedDEListMap[key].DEDataMap[b - 1]) + ',';
                  }
                  body = body.slice(0, -1);
                }
              }
              else {
                for (var j = i * 10000 - 9999; j <= (i * 10000); j++) {
                  body = body + JSON.stringify(SharedDEListMap[key].DEDataMap[j - 1]) + ',';
                }
                body = body.slice(0, -1);
              }
              */

              var temp = SharedDEListMap[key].DEDataMap.splice(0,10000);
              console.log('temp length 10000 : ' + JSON.stringify(temp).length);

              if (JSON.stringify(temp).length < 8300000) {
                body = JSON.stringify(temp);
                FinalResult = await insertSharedDERecFuncWithExtKey(body);
              }
              else {
                body = JSON.stringify(temp.splice(0,5000));
                FinalResult = await insertSharedDERecFuncWithExtKey(body);

                body = JSON.stringify(temp.splice(0,5000));
                FinalResult = await insertSharedDERecFuncWithExtKey(body);
              }

              


              /*
              if (body.length > 8300000) {

                if (recLenDecimal != 0) {
                  var loopDevide;
                  if (i == loopLength) {

                    if ((SharedDEListMap[key].RecordCount % 10000) % 2 == 0) {
                      loopDevide = (SharedDEListMap[key].RecordCount % 10000) / 2;
                    }
                    else {
                      loopDevide = Math.ceil((SharedDEListMap[key].RecordCount % 10000) / 2);
                    }

                    body = "";
                    for (var a = (i * 10000 - 9999); a <= SharedDEListMap[key].RecordCount - loopDevide; a++) {
                      body = body + JSON.stringify(SharedDEListMap[key].DEDataMap[a - 1]) + ',';
                    }
                    body = body.slice(0, -1);
                    body = '[' + body + ']';
                    FinalResult = await insertSharedDERecFuncWithExtKey(body);

                    body = "";
                    for (var a = (i * 10000 - 9999 + (loopDevide + 1)); a <= SharedDEListMap[key].RecordCount; a++) {
                      body = body + JSON.stringify(SharedDEListMap[key].DEDataMap[a - 1]) + ',';
                    }
                    body = body.slice(0, -1);
                    body = '[' + body + ']';
                    FinalResult = await insertSharedDERecFuncWithExtKey(body);

                  }
                  else {

                    body = "";
                    for (var b = (i * 10000 - 9999); b <= (i * 10000 - 5000); b++) {
                      body = body + JSON.stringify(SharedDEListMap[key].DEDataMap[b - 1]) + ',';
                    }
                    body = body.slice(0, -1);
                    body = '[' + body + ']';
                    FinalResult = await insertSharedDERecFuncWithExtKey(body);

                    body = "";
                    //j=i*10000-9999+5001
                    for (var b = (i * 10000 - 4998); b <= (i * 10000); b++) {
                      body = body + JSON.stringify(SharedDEListMap[key].DEDataMap[b - 1]) + ',';
                    }
                    body = body.slice(0, -1);
                    body = '[' + body + ']';
                    FinalResult = await insertSharedDERecFuncWithExtKey(body);

                  }
                }
                else {

                  body = "";
                  for (var j = i * 10000 - 9999; j <= (i * 10000 - 5000); j++) {
                    body = body + JSON.stringify(SharedDEListMap[key].DEDataMap[j - 1]) + ',';
                  }
                  body = body.slice(0, -1);
                  body = '[' + body + ']';
                  FinalResult = await insertSharedDERecFuncWithExtKey(body);



                  body = "";
                  //j=i*10000-9999+5001
                  for (var j = i * 10000 - 4998; j <= (i * 10000); j++) {
                    body = body + JSON.stringify(SharedDEListMap[key].DEDataMap[j - 1]) + ',';
                  }
                  body = body.slice(0, -1);
                  body = '[' + body + ']';
                  FinalResult = await insertSharedDERecFuncWithExtKey(body);

                }
              }
              else {
                FinalResult = await insertSharedDERecFuncWithExtKey(body);
              }
              */




            }
            else {
              var body = '';
              if (recLenDecimal != 0) {
                if (i == loopLength) {
                  for (var a = (i * 10000 - 9999); a <= SharedDEListMap[key].RecordCount; a++) {
                    body = body + JSON.stringify(SharedDEListMap[key].DEDataMap[a - 1]["values"]) + ',';
                  }
                  body = body.slice(0, -1);
                }
                else {
                  for (var b = (i * 10000 - 9999); b <= (i * 10000); b++) {
                    body = body + JSON.stringify(SharedDEListMap[key].DEDataMap[b - 1]["values"]) + ',';
                  }
                  body = body.slice(0, -1);
                }
              }
              else {
                for (var j = i * 10000 - 9999; j <= (i * 10000); j++) {
                  body = body + JSON.stringify(SharedDEListMap[key].DEDataMap[j - 1]["values"]) + ',';
                }
                body = body.slice(0, -1);
              }
              body = '{"items":[' + body + ']}';
              //console.log('body Meri : ' + body);



              /*
              for(var key1 in SharedDEListMap[key].DEDataMap) {
                DEDataInsertWithoutPrimaryKeyBody = DEDataInsertWithoutPrimaryKeyBody + SharedDEListMap[key].DEDataMap[key1]["values"] + ','; 
              }
              DEDataInsertWithoutPrimaryKeyBody = DEDataInsertWithoutPrimaryKeyBody.slice(0, -1);
              DEDataInsertWithoutPrimaryKeyBody = '{"items":[' + DEDataInsertWithoutPrimaryKeyBody + ']}';
              */


              FinalResult = await insertSharedDERecFuncWithoutExtKey(body);
            }







          }
          resolve(FinalResult);
        }
      }
      else {
        FinalResult[key]["DEDataInsert"]["Name"] = SharedDEListMap[key].DEName;
        FinalResult[key]["DEDataInsert"]["StatusCode"] = "200";
        FinalResult[key]["DEDataInsert"]["StatusMessage"] = "Success";
        FinalResult[key]["DEDataInsert"]["Description"] = "Record Count is 0";
        resolve(FinalResult);
      }



      async function insertSharedDERecFuncWithExtKey(ProcessedBody) {
        return new Promise(function (resolve, reject) {

          var Option = {
            'method': 'POST',
            'url': DestinationRestURL + 'hub/v1/dataevents/key:' + key + 'test/rowset',
            'headers': {
              'Authorization': 'Bearer ' + DestinationAccessToken,
              'Content-Type': 'application/json'
            },
            body: ProcessedBody
          };

          request(Option, function (error, response) {
            if (error) throw new Error(error);
            var temp = response.body;
            FinalResult[key]["DEDataInsert"]["Name"] = SharedDEListMap[key].DEName;
            FinalResult[key]["DEDataInsert"]["StatusCode"] = response.statusCode;
            if (response.statusCode == 202 || response.statusCode == 200) {
              FinalResult[key]["DEDataInsert"]["StatusMessage"] = "ok";
              FinalResult[key]["DEDataInsert"]["Description"] = "Success";
            }
            else {
              FinalResult[key]["DEDataInsert"]["StatusMessage"] = temp.resultMessages;
              FinalResult[key]["DEDataInsert"]["Description"] = "-";
            }
            resolve(FinalResult);
          });
        })
      }
      async function insertSharedDERecFuncWithoutExtKey(ProcessedBody) {
        return new Promise(function (resolve, reject) {

          var Option = {
            'method': 'POST',
            'url': DestinationRestURL + 'data/v1/async/dataextensions/key:' + key + 'test/rows',
            'headers': {
              'Authorization': 'Bearer ' + DestinationAccessToken,
              'Content-Type': 'application/json'
            },
            body: ProcessedBody
          };
          request(Option, function (error, response) {
            if (error) throw new Error(error);
            var temp = response.body;
            FinalResult[key]["DEDataInsert"]["Name"] = SharedDEListMap[key].DEName;
            FinalResult[key]["DEDataInsert"]["StatusCode"] = response.statusCode;
            if (response.statusCode == 202 || response.statusCode == 200) {
              FinalResult[key]["DEDataInsert"]["StatusMessage"] = "ok";
              FinalResult[key]["DEDataInsert"]["Description"] = "Success";
            }
            else {
              FinalResult[key]["DEDataInsert"]["StatusMessage"] = temp.resultMessages;
              FinalResult[key]["DEDataInsert"]["Description"] = "-";
            }
            resolve(FinalResult);
          });
        })
      }


    })
  }

  /*var folderResult = {};
  async function CheckDataFolder() {
    return new Promise(function (resolve, reject) {
      var options = {
        'method': 'POST',
        'url': DestinationSoapURL + 'Service.asmx',
        'headers': {
          'Content-Type': 'text/xml',
          'SoapAction': 'Retrieve',
          'Authorization': 'Bearer ' + DestinationAccessToken
        },
        body: '<?xml version="1.0" encoding="UTF-8"?>\r\n<s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope" xmlns:a="http://schemas.xmlsoap.org/ws/2004/08/addressing" xmlns:u="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">\r\n    <s:Header>\r\n        <a:Action s:mustUnderstand="1">Retrieve</a:Action>\r\n        <a:MessageID>urn:uuid:7e0cca04-57bd-4481-864c-6ea8039d2ea0</a:MessageID>\r\n        <a:ReplyTo>\r\n            <a:Address>http://schemas.xmlsoap.org/ws/2004/08/addressing/role/anonymous</a:Address>\r\n        </a:ReplyTo>\r\n        <a:To s:mustUnderstand="1">' + DestinationSoapURL + 'Service.asmx</a:To>\r\n        <fueloauth xmlns="http://exacttarget.com">' + DestinationAccessToken + '</fueloauth>\r\n    </s:Header>\r\n    <s:Body xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">\r\n        <RetrieveRequestMsg xmlns="http://exacttarget.com/wsdl/partnerAPI">\r\n            <RetrieveRequest>\r\n                <ObjectType>DataFolder</ObjectType>\r\n                <Properties>ID</Properties>\r\n                <Properties>Name</Properties>\r\n                <Properties>ContentType</Properties>\r\n                <Properties>ParentFolder.Name</Properties>\r\n                <Properties>ObjectID</Properties>\r\n                <Properties>ParentFolder.ObjectID</Properties>\r\n\r\n                <ns1:Filter\r\n                     xmlns:ns1="http://exacttarget.com/wsdl/partnerAPI" xsi:type="ns1:SimpleFilterPart">\r\n                     <ns1:Property>ContentType</ns1:Property>\r\n                     <ns1:SimpleOperator>equals</ns1:SimpleOperator>\r\n                     <ns1:Value>shared_dataextension</ns1:Value>\r\n                </ns1:Filter>\r\n\r\n                <QueryAllAccounts>true</QueryAllAccounts>\r\n            </RetrieveRequest>\r\n      </RetrieveRequestMsg>\r\n   </s:Body>\r\n</s:Envelope>'

      };
      request(options, function (error, response) {
        if (error) throw new Error(error);

        xml2jsParser.parseString(response.body, function (err, result) {
          //console.log('mera field result : ' + JSON.stringify(result['soap:Envelope']['soap:Body'][0]['RetrieveResponseMsg'][0]['Results']));
          for(var key in result['soap:Envelope']['soap:Body'][0]['RetrieveResponseMsg'][0]['Results']) {
            folderResult[result['soap:Envelope']['soap:Body'][0]['RetrieveResponseMsg'][0]['Results'][key]['Name']] = {
              "FolderName" : result['soap:Envelope']['soap:Body'][0]['RetrieveResponseMsg'][0]['Results'][key]['Name'],
              "ParentFolderName" : result['soap:Envelope']['soap:Body'][0]['RetrieveResponseMsg'][0]['Results'][key]["ParentFolder"]["Name"],
              "FolderId" : result['soap:Envelope']['soap:Body'][0]['RetrieveResponseMsg'][0]['Results'][key]["ID"]
            }
          }
        });
        console.log('Folder Result : ' + JSON.stringify(folderResult));
        if("Shared DE" in folderResult) {
          resolve(folderResult)
        }
        else {

        }

      });
    })
  }
*/





  app.post("/SharedDEListShowAPI", async (req, res) => {
    if (req.body.reqForDEList = 'True') {
      SharedDEListMap = await getSourceListOfSharedDE();
      SharedDEListMap = await getSourceSharedDEFieldsAndData();
      //console.log('DEListMap Last : ' + JSON.stringify(DEListMap));
      //DEListSend from getSourceDEFieldsAndData
      //console.log('SharedDEListSend : ' + JSON.stringify(SharedDEListSend));
      res.send(SharedDEListSend);
    }
  });

  app.post("/SelectedSharedDEListInsert", async (req, res) => {
    if (req.body.reqForSelectedDEList) {
      selectedDEList = req.body.reqForSelectedDEList;
      
      for (var key in selectedDEList.WithoutData) {
        FinalSharedDEInsert(key);
      }
      async function FinalSharedDEInsert(key) {
        let delay = 1000;
        var bool = false;
        var bool1 = false;
        let timerId = setTimeout(async function request() {
          if (bool == false) {
            delay *= 24*60*60;
            bool1 = true;
            timerId = setTimeout(request, delay);
          }
          if (bool1 == true) {
            bool = true;

            //for (var key in selectedDEList.WithoutData) {
              await insertSharedDEtoDestination(key);
              if(selectedDEList.WithData) {
                if(key in selectedDEList.WithData) {
                  insertSharedDEDataToDestination(key);
                }
              }
              console.log('FinalResult : ' + JSON.stringify(FinalResult));
            //}

            clearTimeout(timerId);
          }
        }, delay);
      }
      console.log('FinalResult : ' + JSON.stringify(FinalResult));
    }
    res.send(FinalResult);
    FinalResult = {};





  });










});
app.listen(port, () => {
  console.log('Example app is listening on port http://localhost:${port}');
});