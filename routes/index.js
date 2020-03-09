var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  // res.render('index', { title: 'Express' });
  res.send({ test: 'testing' })
  // console.log("test")
  // res.sendFile(path.join(__dirname, '../public/home.html'));
});

module.exports = router;
