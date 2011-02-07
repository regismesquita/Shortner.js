var redis = require("redis"),
    client = redis.createClient();

client.on("error", function (err) {
    console.log("Error " + err);
});

var http = require('http'),
    express = require('express');

var app = express.createServer();
app.use(express.bodyDecoder());

var store = function(site, url, res)
{
    client.set(site, url);
    client.set(site+"_counter", 0);
    res.send(site + ' now contains ' + url + '.\n');
};

var storeSiteFromParams = function(req, res)
{
    store(req.params.site, req.body.siteurl, res);
};

app.post('/store/:site', storeSiteFromParams);

app.post('/', function(req, res)
{
    store(req.body.site, req.body.siteurl, res);
});

app.put('/:site', storeSiteFromParams);
app.get('/:site', function(req, res)
{
    client.setnx(req.params.site+"_counter",0)
    client.incr(req.params.site+"_counter")
    client.get(req.params.site,function (err,reply){
      res.redirect(reply)
    })
});
app.get('/info/:site', function(req, res)
{
    client.setnx(req.params.site+"_counter",0)
    client.get(req.params.site+"_counter",function (err,reply){
      res.send("The "+req.params.site+" has been accessed "+reply+" times.")
    })
});

app.listen(8000);
