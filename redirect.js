var redis = require("redis"),
    client = redis.createClient();

client.on("error", function (err) {
    console.log("Error " + err);
});

var http = require('http'),
    express = require('express');

var app = express.createServer();
app.use(express.bodyDecoder());

var store = function(site, url)
{
    client.set(site, url);
    res.send(site + ' now contains ' + url + '.\n');
};

app.post('/store/:site', function(req, res)
{
    store(req.params.site, req.body.siteurl);
});

app.get('/:site', function(req, res)
{
    client.get(req.params.site,function (err,reply){
      res.redirect(reply)
    })
});
app.listen(8000);
