var express = require('express');
var bodyParser = require('body-parser');

var hungarianAlgCtrl = require('./app/Controllers/HungarianAlgCtrl');
var validationCtrl = require('./app/Controllers/ValidationCtrl');

var app = express();

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;    // set our port

var router = express.Router();

router.use(function(req, res, next) {
  if (validationCtrl.validate(req))
    next();
  else
    res.jsonp({errors:validationCtrl.getValidationError()});
});

router.get('/api/findAssignments',function (req, res) {
  var inputMatrix = JSON.parse(req.query.inputMatrix);

  var steps = hungarianAlgCtrl.findAssignments(inputMatrix);

  res.jsonp(steps);
});

app.use('/hungarian', router);

app.listen(port);
console.log('Server running on port '+port);