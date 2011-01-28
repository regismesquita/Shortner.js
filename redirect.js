var redis = require("redis"),
    client = redis.createClient();

client.on("error", function (err) {
    console.log("Error " + err);
});

var http = require('http'),
    express = require('express');

var app = express.createServer();
app.use(express.bodyDecoder());

app.post('/store/:site', function(req, res)
{
    client.set(req.params.site,req.body.siteurl)
    res.send(req.params.site + ' now contains ' + req.body.siteurl + '.\n');
});

app.get('/:site', function(req, res)
{
    client.get(req.params.site,function (err,reply){
      res.redirect(reply)
    })
});
app.listen(8000);
