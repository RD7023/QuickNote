var express = require('express');
var path = require('path');
const db = require('./queries')
const multer = require('multer');


/* SET WHERE IMAGES ARE STORED */
const storage = multer.diskStorage({
  destination:'./public/uploads/',
  filename: function (req,file,cb) {
    cb(null,file.fieldname + '-' + Date.now() + path.extname(file.originalname))
  }
})
const upload = multer({
  storage: storage,
  limits:{filesize:5000000},
  fileFilter: function (req,file,cb) {
    checkFileType(file,cb)
  }
}).single('myImage')
function checkFileType(file,cb) {
  //Allow extensions
  const filetypes = /jpeg|jpg|png/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);
  if (mimetype && extname) {
    return cb(null,true);
  }
  else {
    cb('Error: Images Only!')
  }
}

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



/* GET selected note page. */
router.get('/:subjId/:noteId', function (req, res, next) {
  if (!req.session.success) {
    res.redirect('/');
  } else {
    db.getUserNote(req,res);
  }
});

router.post('/:subjId/:noteId/upload',(req, res, next) =>{
  upload(req,res, (err) => {
    if (err) {

    }
    else {
      if (req.file == undefined) {

      }
      else {
        db.uploadPhoto(req,res);

      }
    }
  })
})

router.post('/:subjId/:noteId/save',(req, res, next) => {
  db.saveNote(req,res);
})

router.post('/:subjId/:noteId/getTextFromPhoto',(req, res, next) => {
  var photo = req.body.getTextFromPhoto;

  photo = photo.replace('/',"\\");
  photo = photo.replace('/',"\\");
  photo = photo.replace('/',"\\");


  const { spawn } = require('child_process');
  const pyProg = spawn('python', ['public/tesserocr-master/scratch.py',photo]);
  pyProg.stdout.on('data', function(data) {
        console.log(data.toString());
        db.saveTextFromPhoto(req,res,data.toString());
    });
})



/* GET subjects notes page. */
router.get('/:subjId', function (req, res, next) {
  if (!req.session.success) {
    res.redirect('/');
  } else {
    db.getUserSubjectNotes(req,res);
  }
});

router.post('/:subjId/createNote',function (req,res,next) {
  db.createUserSubjectNotes(req,res);
})




module.exports = router;
