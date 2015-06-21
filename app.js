
var express = require('express'),
	app = express();

// require file that gives the data
var dataFile = require('./controllers/data_controller.js');

// where angular will be served from
app.use(express.static(__dirname + '/public'));

// api call to get data
app.get('/api/users/john', function(req,res) {
	var data = dataFile.getData();
	res.send(data);
});

// start server
app.listen(3000, function() {
	console.log('Server started');
});
