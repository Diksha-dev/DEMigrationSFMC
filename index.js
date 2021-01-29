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
  

  
  app.post('/stack', (req, res) => {
    console.log('Chal gya');
  })
  
  
  
  app.listen(port, () => {
     console.log('Example app is listening on port http://localhost:${port}');
  });