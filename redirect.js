var redis = require("redis"),
    client = redis.createClient();

client.on("error", function (err) {
    console.log("Error " + err);
});

var http = require('http'),
    express = require('express');
require('datejs')


var app = express.createServer();
app.use(express.bodyDecoder());

var store = function(site, url, res)
{
    if (!validateSite(site, res)) {return;}
    client.get(site, function(err, reply) {
        if (null == reply) {
            client.set(site, url);
            client.set(toInfoKey(site), 0);
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

var toInfoShortcut = function(site) {
    return isInfoShortcut(site) ? site : site + '+';
};

var toInfoKey = function(site) {
    return site.replace('+', '')+'-'+Date.today().toString("d/M/yyyy")
};

var getKeysForGraph = function(site){
  keys = [];
  date = Date.parse('today');
  for (var i=0; i < 7; i++) {
    key = site.replace('+', '')+'-'+date.toString("d/M/yyyy");
    keys.push(key);
    date.add(-1).days();
  };
  return keys;
};  

var buildGraphUrl = function(keys, values){
  if (values[0] == null) values[0] = 0
  val = values[0];
  data = keys[0].split('-')[1].split('/')
  k = '|'+data[0]+'%2F'+data[1]        
  for (var i=1; i < values.length; i++) {
    if (values[i] != null){
      val += ','+values[i]
      data = keys[i].split('-')[1].split('/')
      k += '|'+data[0]+'%2F'+data[1]      
    }      
  };

  return 'http://chart.apis.google.com/chart?chxl=0:'+k+'&chxr=0,-3.333,100&chxt=x,y&chbh=23,15,10&chs=350x200&cht=bvs&chds=1.667,150&chd=t:'+val
  
};

var showGraph = function(site, res) {
  keys = getKeysForGraph(site);
  client.mget(keys, function(err, reply){
    graphUrl = buildGraphUrl(keys, reply);
    res.redirect(graphUrl, 301);  
  });
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

    client.setnx(toInfoKey(site), 0);
    client.get(site,function (err,reply){
        if (isInfoShortcut(site)) {      
          showGraph(site, res)  
        } else {
            client.incr(toInfoKey(site));
            res.redirect(reply, 301);
        }
    });
});

app.listen(8000);
