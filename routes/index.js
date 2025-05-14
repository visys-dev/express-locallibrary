var express = require('express');
var router = express.Router();

/* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('index', { title: 'Express' });
// });

// GET домашньої сторінки.
router.get("/", function (req, res) {
  res.redirect("/catalog");
});

router.get('/my-page', (req, res) => {
  res.render('my_page', { title: 'My route', items: ['Element 1', 'Element 2', 'Element 3'] });
});


module.exports = router;
