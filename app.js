
var express = require('express'),
	app = express();

// require file that gives the data
var dataFile = require('./controllers/data_controller.js');

// where angular will be served from
app.use(express.static(__dirname + '/public'));

// root of angular app
app.get('/', function(req, res) {
    res.sendfile('./public/index.html', {root: __dirname + "/public" });
});

// api call to get data
app.get('/api/users/john', function(req,res) {
	var data = dataFile.getData();
	res.send(data);
});

// start server
var port = process.env.PORT || 3000;
app.listen(port, function() {
	console.log('Server started');
});
