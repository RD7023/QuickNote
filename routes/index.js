var express = require('express');
const db = require('./queries')
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Form Validation', success: req.session.success, errors:req.session.errors});
  req.session.errors=null;
  req.session.success=null;
});
router.post('/submit',function(req,res,next){
  //Check validity
  req.check('email','Invalid email address').isEmail();
  req.check('password','Password is invalid').isLength({min: 4}).equals(req.body.confirmPassword)



  var errors = req.validationErrors();
  if (errors) {
    req.session.errors = errors;
    req.session.success = false;
  }
  else {
    req.session.success = true;
    db.createUser(req, res);
  }
  res.redirect('/')
})

module.exports = router;
