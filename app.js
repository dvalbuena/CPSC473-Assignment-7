var express = require('express');
var app = express();

var redis = require('redis');
var client = redis.createClient();

client.on('connect', function() {
    console.log('connected');
});

app.set('view engine', 'jade');


var randValue = function(){
	//will return a random base 36 string
	var x =	Math.floor((Math.random() * (1000000000-1000)) + 1000).toString(36);
	console.log(x)
	return (x);
}

function isShort(url) {
	if(url.substring(0,15) === "localhost:3000/")
	{
		return true;
	} else {
		return false;
	}
}


app.get('/', function(req, res) { 
	res.render('index', {title: 'Hey', message: 'Hello there!'});
});

app.get('/check', function(req, res) {
	var url = req.param('url');

	console.log("URL " + url);

	// Is the url already an existing short url 
	client.get(url, function(err, reply) {
		if(reply !== null && !isShort(url)) {
			res.render('index', {shortlink: reply});
		} else if (reply === null && !isShort(url)){
			// add url short url 
			var shorturl = 'localhost:3000/' + randValue();
			client.set(shorturl, url);
			client.set(url, shorturl);

			client.set('count:' + shorturl, 0);
			client.add('count', 1, shorturl);

			res.render('index', {shortlink: shorturl});
		} else if (reply !== null && isShort(url)) {
			res.redirect('http://' + reply);
		} else {
			res.render('index', {'shortlink': 'This short link does not exist'});
		}
	});
});

app.get('/:id?', function(req, res) {
	var id = req.params.id;
	var url = "localhost:3000/" + id;
	client.get(url, function(err, reply) {
		res.redirect('http://' + reply);
	});
});


var server = app.listen(3000, function() {
	console.log('Listening on port 3000');
});
