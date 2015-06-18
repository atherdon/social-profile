
var express = require('express'),
	app = express();

var port = process.env.PORT || 3000;

app.use(express.static(__dirname + '/public'));

app.listen(port, function() {
	console.log('Server started');
});