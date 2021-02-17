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
var DEFieldMap = {};

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
    console.log('auth chala');
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
            else if(!'Scale' in SourceDEFieldsResult[key] && 'MaxLength' in SourceDEFieldsResult[key]) {
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
            else if('Scale' in SourceDEFieldsResult[key] && !'MaxLength' in SourceDEFieldsResult[key]) {
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




  async function getDEData(key) {
    return new Promise(function (resolve, reject) {
      var DEDataBody = '';
      DEDataBody = '<?xml version="1.0" encoding="UTF-8"?>' +
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


      DEDataBody = DEDataBody + '</RetrieveRequest>' +
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
      request(DEDataOptions, function (error, response) {
        if (error) throw new Error(error);
        //console.log('DE Data' + response.body);

        SourceDEDataResult = response.body;

        xml2jsParser.parseString(SourceDEDataResult, function (err, result) {
          //console.log('mera result : ' + JSON.stringify(result['soap:Envelope']['soap:Body'][0]['RetrieveResponseMsg'][0]['Results']));
          SourceDEDataResult = result['soap:Envelope']['soap:Body'][0]['RetrieveResponseMsg'][0]['Results'];
        });
        
        //SourceDEDataResult = SourceDEDataResult.replace(/:/g, "");
        //SourceDEDataResult = xmlParser.toJson(SourceDEDataResult);
        //SourceDEDataResult = JSON.parse(SourceDEDataResult);
        //SourceDEDataResult = SourceDEDataResult.soapEnvelope.soapBody.RetrieveResponseMsg.Results;

        DEListMap[key].DEDataMap = [];
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

        resolve(SourceDEDataResult);
      });
    })
  }




























  async function insertDEtoDestination() {
    return new Promise(function (resolve, reject) {
      var DEListBody = '';
      var DEInsertResult = [];
      for (var key in selectedDEList.WithoutData) {
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
              DEListBody = DEListBody + '<Field xsi:type="ns2:DataExtensionField">' +
                '<CustomerKey>' + DEListMap[key].DEFieldMap[i].FieldName + '</CustomerKey>' +
                '<Name>' + DEListMap[key].DEFieldMap[i].FieldName + '</Name>' +
                '<Label>' + DEListMap[key].DEFieldMap[i].FieldName + '</Label>' +
                '<IsRequired>' + DEListMap[key].DEFieldMap[i].FieldIsRequired + '</IsRequired>' +
                '<IsPrimaryKey>' + DEListMap[key].DEFieldMap[i].FieldIsPrimaryKey + '</IsPrimaryKey>' +
                '<FieldType>' + DEListMap[key].DEFieldMap[i].FieldFieldType + '</FieldType>' +
                '<MaxLength>' + DEListMap[key].DEFieldMap[i].FieldMaxLength + '</MaxLength>' +
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
              DEListBody = DEListBody + '<Field xsi:type="ns2:DataExtensionField">' +
                '<CustomerKey>' + DEListMap[key].DEFieldMap[i].FieldName + '</CustomerKey>' +
                '<Name>' + DEListMap[key].DEFieldMap[i].FieldName + '</Name>' +
                '<Label>' + DEListMap[key].DEFieldMap[i].FieldName + '</Label>' +
                '<IsRequired>' + DEListMap[key].DEFieldMap[i].FieldIsRequired + '</IsRequired>' +
                '<IsPrimaryKey>' + DEListMap[key].DEFieldMap[i].FieldIsPrimaryKey + '</IsPrimaryKey>' +
                '<FieldType>' + DEListMap[key].DEFieldMap[i].FieldFieldType + '</FieldType>' +
                '<MaxLength>' + DEListMap[key].DEFieldMap[i].FieldMaxLength + '</MaxLength>' +
                '<DefaultValue>' + tempDefaultValue + '</DefaultValue>' +
                '</Field>';
            }
          }

          DEListBody = DEListBody + '</Fields>' +
            '</Objects>' +
            '</CreateRequest>' +
            '</soapenv:Body>' +
            '</soapenv:Envelope>';


          console.log(DEListMap[key].DEName + ' : DEInsertListBody : ' + DEListBody);

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
              console.log(DEListMap[key].DEName + ' : DEInsert statusCode : ' + response.statusCode + ', Body : ' + response.body);
              DEInsertResult.push(response.body);
              resolve(DEInsertResult);
            });
          }
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

          console.log(DEListMap[key].DEName + ' : DEDataInsertWithPrimaryKeyBody : ' + DEDataInsertWithPrimaryKeyBody)

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
            console.log(DEListMap[key].DEName + ' : DEDataInsert statusCode : ' + response.statusCode + ', Body : ' + response.body);
            resolve(response.body);
          });






        }
        else {
          for(var key1 in DEListMap[key].DEDataMap) {
            for(var key2 in DEListMap[key].DEDataMap[key1].Property) {
              if(JSON.stringify(DEListMap[key].DEDataMap[key1].Property[key2].Value[0]) != '{}') {
                DEDataInsertWithoutPrimaryKeyBody = DEDataInsertWithoutPrimaryKeyBody + '{ "' + DEListMap[key].DEDataMap[key1].Property[key2].Name[0] + '" : "' + DEListMap[key].DEDataMap[key1].Property[key2].Value[0] + '" },';
              }
            }
          }
          DEDataInsertWithoutPrimaryKeyBody = DEDataInsertWithoutPrimaryKeyBody.slice(0, -1);
          DEDataInsertWithoutPrimaryKeyBody = '{"items":[' + DEDataInsertWithoutPrimaryKeyBody + ']}';
          
  
          //DEDataInsertWithoutPrimaryKeyBody = '{ "items": [{ "SubscriberKey" : "01" , "EmailAddress" : "test01@test.com" , "Lastname" : "Test" , "Date Test" : "02/08/2021" , "Decimal Test" : 12.22 } , { "SubscriberKey" : "02" ,  "EmailAddress" : "test02@test.com" , "Lastname" : "Test" , "Date Test" : "02/08/2021" , "Decimal Test" : "12.12" }] }';
  
          console.log(key + ' : DEDataInsertWithoutPrimaryKeyBody : ' + DEDataInsertWithoutPrimaryKeyBody);
  
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
            console.log('DATAInsert ResponseBody ' + JSON.stringify(response));
            resolve(response.body);
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

      var DEinsertResult = await insertDEtoDestination();

      if(DEinsertResult) {
        for(var key in selectedDEList.WithData) {
          var temp0  = await insertDEDataToDestination(key);
          console.log(key + ' : ' + temp0);
        }
      }
    }

    res.send('reqForSelectedDEList');
  });












});
app.listen(port, () => {
  console.log('Example app is listening on port http://localhost:${port}');
});