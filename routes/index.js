var express = require('express');
const db = require('./queries')

var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Form Validation', success: req.session.success, errors:req.session.errors, username:req.session.username, email:req.session.userEmail});
  req.session.errors=null;
});

router.post('/submitSignUp',function(req,res,next){
  //Check validity
  req.check('emailSignUp','Invalid email address').isEmail();
  req.check('passwordSignUp','Password is invalid').isLength({min: 4}).equals(req.body.confirmPasswordSignUp)

  var errors = req.validationErrors();
  if (errors) {
    req.session.errors = errors;
    req.session.success = false;
    res.redirect('/');
  }
  else {
    db.createUser(req, res);
  }
})

router.post('/submitLogin',function (req,res,next) {
  //Check validity
  req.check('emailLogin','Invalid email address').isEmail();
  req.check('passwordLogin','Password is invalid').isLength({min: 4});

  var errors = req.validationErrors();
  console.log(req.body.emailLogin);
  if (errors) {
    req.session.errors = errors;
    req.session.success = false;
    res.redirect('/')
  }
  else {
    db.validateUserByLoginEndPassword(req, res);
  }
})

router.post('/logout',function (req,res,next) {
  req.session.success = false;
  req.session.username=null;
  req.session.userEmail=null;
  res.redirect('/')
})
module.exports = router;
