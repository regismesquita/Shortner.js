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
    if (!validateSite(site, res)) {return;}
    client.get(site, function(err, reply) {
        if (null == reply) {
            client.set(site, url);
            client.set(site + '+', 0);
            res.send(site + ' now contains ' + url + '.\n');
        } else {
            res.send(409);
        }
    });
};

var isInfoShortcut = function(site)
{
    return '+' == site[site.length - 1];
};

var validateSite = function(site, response)
{
    if (isInfoShortcut(site)) {
        response.send('Shortcut cannot end with plus sign (+)\n', 400);
        return false;
    }
    return true;
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
    var site = req.params.site;
    client.get(site,function (err,reply){
        if (isInfoShortcut(site)) {
            res.send(reply);
        } else {
            client.incr(site + '+');
            res.redirect(reply, 301);
        }
    })
});
app.listen(8000);
