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
        SourceListDEResult = SourceListDEResult.replace(/:/g, "");
        SourceListDEResult = xmlParser.toJson(SourceListDEResult);
        SourceListDEResult = JSON.parse(SourceListDEResult);
        SourceListDEResult = SourceListDEResult.soapEnvelope.soapBody.RetrieveResponseMsg.Results;


        var DEListMap = {};
        for (var key in SourceListDEResult) {
          if (SourceListDEResult[key].Name != "ExpressionBuilderAttributes" && SourceListDEResult[key].Name != "_MobileAddress" && SourceListDEResult[key].Name != "_MobileSubscription" && SourceListDEResult[key].Name != "_PushAddress" && SourceListDEResult[key].Name != "_PushTag" && SourceListDEResult[key].Name != "_MobileLineAddressContact" && SourceListDEResult[key].Name != "_MobileLineAddress" && SourceListDEResult[key].Name != "_MobileLineProfile" && SourceListDEResult[key].Name != "_MobileLineProfileAttribute" && SourceListDEResult[key].Name != "_MobileLineSubscription" && SourceListDEResult[key].Name != "MobileLineOrphanContact") {
            if (SourceListDEResult[key].IsSendable == "true") {
              DEListMap[SourceListDEResult[key].CustomerKey] = {
                "DEName": SourceListDEResult[key].Name,
                "DECustomerKey": SourceListDEResult[key].CustomerKey,
                "DEIsSendable": SourceListDEResult[key].IsSendable,
                "DEIsTestable": SourceListDEResult[key].IsTestable,
                "DEDescription": SourceListDEResult[key].Description,
                "DESendDEField": SourceListDEResult[key].SendableDataExtensionField.Name,
                "DESendSubsField": SourceListDEResult[key].SendableSubscriberField.Name,
                "DEFieldMap": [],
                "DEDataMap": []
              };
            }
            else {
              DEListMap[SourceListDEResult[key].CustomerKey] = {
                "DEName": SourceListDEResult[key].Name,
                "DECustomerKey": SourceListDEResult[key].CustomerKey,
                "DEIsSendable": SourceListDEResult[key].IsSendable,
                "DEIsTestable": SourceListDEResult[key].IsTestable,
                "DEDescription": SourceListDEResult[key].Description,
                "DESendDEField": '',
                "DESendSubsField": '',
                "DEFieldMap": [],
                "DEDataMap": []
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
        SourceDEFieldsResult = SourceDEFieldsResult.replace(/:/g, "");
        SourceDEFieldsResult = xmlParser.toJson(SourceDEFieldsResult);
        SourceDEFieldsResult = JSON.parse(SourceDEFieldsResult);
        SourceDEFieldsResult = SourceDEFieldsResult.soapEnvelope.soapBody.RetrieveResponseMsg.Results;
        //console.log('SourceDEFieldsResult :' + JSON.stringify(SourceDEFieldsResult));

        var FieldSet = new Set();
        for (var key in SourceDEFieldsResult) {
          if (SourceDEFieldsResult[key].DataExtension.CustomerKey in DEListMap) {
            FieldSet.add(JSON.stringify({
              "DEExtKey": SourceDEFieldsResult[key].DataExtension.CustomerKey,
              "Name": SourceDEFieldsResult[key].Name,
              "IsRequired": SourceDEFieldsResult[key].IsRequired,
              "IsPrimaryKey": SourceDEFieldsResult[key].IsPrimaryKey,
              "FieldType": SourceDEFieldsResult[key].FieldType,
              "MaxLength": SourceDEFieldsResult[key].MaxLength,
              "Scale": SourceDEFieldsResult[key].Scale,
              "DefaultValue": SourceDEFieldsResult[key].DefaultValue
            }));
          }
        }
        //console.log('IGO_PROFILES-FieldSet : ' + [...FieldSet]);

        var SourceDEFieldsResult = [];
        for (var val of Array.from(FieldSet)) {
          SourceDEFieldsResult.push(JSON.parse(val));
        }


        for (var key in SourceDEFieldsResult) {
          if (SourceDEFieldsResult[key].DEExtKey in DEListMap) {
            DEListMap[SourceDEFieldsResult[key].DEExtKey].DEFieldMap.push({
              "FieldName": SourceDEFieldsResult[key].Name,
              "FieldIsRequired": SourceDEFieldsResult[key].IsRequired,
              "FieldIsPrimaryKey": SourceDEFieldsResult[key].IsPrimaryKey,
              "FieldFieldType": SourceDEFieldsResult[key].FieldType,
              "FieldMaxLength": SourceDEFieldsResult[key].MaxLength,
              "FieldScale": SourceDEFieldsResult[key].Scale,
              "FieldDefaultValue": SourceDEFieldsResult[key].DefaultValue
            });

          }
          else {
            DEListMap[SourceDEFieldsResult[key].DEExtKey].DEFieldMap = [{
              "FieldName": SourceDEFieldsResult[key].Name,
              "FieldIsRequired": SourceDEFieldsResult[key].IsRequired,
              "FieldIsPrimaryKey": SourceDEFieldsResult[key].IsPrimaryKey,
              "FieldFieldType": SourceDEFieldsResult[key].FieldType,
              "FieldMaxLength": SourceDEFieldsResult[key].MaxLength,
              "FieldScale": SourceDEFieldsResult[key].Scale,
              "FieldDefaultValue": SourceDEFieldsResult[key].DefaultValue
            }];
          }
        }



        //-----------------------------------------

        for (var key in DEListMap) {
          await getDEData(key);
        }
        //console.log('DEListMap.DEDataMap : ' + JSON.stringify(DEListMap));



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
        SourceDEDataResult = SourceDEDataResult.replace(/:/g, "");
        SourceDEDataResult = xmlParser.toJson(SourceDEDataResult);
        SourceDEDataResult = JSON.parse(SourceDEDataResult);
        SourceDEDataResult = SourceDEDataResult.soapEnvelope.soapBody.RetrieveResponseMsg.Results;

        DEListMap[key].DEDataMap = [];
        for (var key1 in SourceDEDataResult) {
          if (key1 != 'xsitype' && key1 != 'PartnerKey' && key1 != 'ObjectID' && key1 != 'Type' && key1 != 'Properties') {
            DEListMap[key].DEDataMap.push(SourceDEDataResult[key1].Properties);
          }
          else if (key1 == 'Properties') {
            DEListMap[key].DEDataMap.push(SourceDEDataResult["Properties"]);
          }
        }

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
            '<CustomerKey>' + selectedDEList.WithoutData[key].DEExtKey + 'testFzl' + '</CustomerKey>' +
            '<Name>' + selectedDEList.WithoutData[key].DEName + 'testFzl' + '</Name>' +
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
          for (var i = 0; i < DEListMap[key].DEFieldMap.length; i++) {
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
                tempDefaultValue = DDEListMap[key].DEFieldMap[i].FieldDefaultValue;
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


          //console.log('DEListBody : ' + DEListBody);
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

      var DEDataInsertBody = '';
      if(DEListMap[key].DEDataMap.length != 0) {
        for(var key1 in DEListMap[key].DEDataMap) {
          for(var key2 in DEListMap[key].DEDataMap[key1].Property) {
            if(JSON.stringify(DEListMap[key].DEDataMap[key1].Property[key2].Value) != '{}') {
              DEDataInsertBody = DEDataInsertBody + '{ "' + DEListMap[key].DEDataMap[key1].Property[key2].Name + '" : "' + DEListMap[key].DEDataMap[key1].Property[key2].Value + '" },';
            }
          }
        }
        DEDataInsertBody = DEDataInsertBody.slice(0, -1);
        DEDataInsertBody = '{"items":[' + DEDataInsertBody + ']}';

        var DEDataInsertOption = {
          'method': 'POST',
          'url': DestinationRestURL + 'data/v1/async/dataextensions/key:' + key + '/rows',
          'headers': {
            'Authorization': 'Bearer ' + DestinationAccessToken,
            'Content-Type': 'application/json'
          },
          body: DEDataInsertBody
        };
        request(DEDataInsertOption, function (error, response) {
          if (error) throw new Error(error);
          console.log(JSON.stringify(error));
          console.log('DATAInsert ResponseBody ' + JSON.stringify(response));
          console.log('DATAInsert ResponseBody ' + response);
          resolve(response.body);
        });



      }
    })
  }


















  app.post("/DEListShowAPI", async (req, res) => {
    if (req.body.reqForDEList = 'True') {
      DEListMap = await getSourceListOfDE();
      DEListMap = await getSourceDEFieldsAndData();
      // console.log('DEListMap Last : ' + JSON.stringify(DEListMap));

      for (var key in DEListMap) {
        DEListMap[key].FieldCount = DEListMap[key].DEFieldMap.length;
        DEListMap[key].RecordCount = DEListMap[key].DEDataMap.length;
      }

      res.send(DEListMap);
    }
  });















  app.post("/SelectedDEListInsert", async (req, res) => {

    if (req.body.reqForSelectedDEList) {
      selectedDEList = req.body.reqForSelectedDEList;
      console.log('reqForSelectedDEList : ' + JSON.stringify(selectedDEList));

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