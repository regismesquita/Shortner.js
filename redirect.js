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

var storeSiteFromParams = function(req, res)
{
    store(req.params.site, req.body.siteurl);
};

app.post('/store/:site', storeSiteFromParams);

app.post('/', function(req, res)
{
    store(req.body.site, req.body.siteurl);
});

app.put('/:site', storeSiteFromParams);
app.get('/:site', function(req, res)
{
    client.get(req.params.site,function (err,reply){
      res.redirect(reply)
    })
});
app.listen(8000);
