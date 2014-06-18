var express = require('express');
var basicAuth = require('basic-auth-connect');

var app = express();

var oneDay = 86400000;

app.use(basicAuth(function(user, password) {
  return user === process.env.USER && password === process.env.PASS;
}));

app.use(express.static(__dirname + '/site', { maxAge: oneDay }));

app.listen(process.env.PORT || 3000);
