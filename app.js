
var express = require('express'),
	app = express();

var dataFile = require('./controllers/data_controller.js');

var port = process.env.PORT || 3000;
app.use(express.static(__dirname + '/public'));

app.get('/api/users/john', function(req,res) {
	var data = dataFile.getData();
	res.send(data);
});

app.listen(port, function() {
	console.log('Server started');
});
