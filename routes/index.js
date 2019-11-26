var express = require('express');
const db = require('./queries')

var router = express.Router();

/* GET home or auth page. */
router.get('/', function(req, res, next) {
  db.getUserSubjects(req,res);
  req.session.errors=null;
});

/* POST on home or auth page. */
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

router.post('/createSubject',function (req,res,next) {
  db.createUserSubject(req,res);
})

/* GET subjects notes page. */
router.get('/:subjId', function(req, res, next) {
  if (!req.session.success) {
    res.redirect('/');
  } else {
    db.getUserSubjectNotes(req,res);
  }
});



module.exports = router;
