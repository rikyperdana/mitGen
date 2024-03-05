var
express = require('express'),
mongoDB = require('mongodb'),
dotenv = require('dotenv').config()

mongoDB.MongoClient.connect(
  process.env.MONGO,
  {useNewUrlParser: true, useUnifiedTopology: true},
  (err, client) => {
    var app = express().use(express.json())
    .use(express.static('public'))
    .listen(process.env.PORT)
  }
)