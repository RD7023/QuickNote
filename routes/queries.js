const Pool = require('pg').Pool
var passwordHash = require('../node_modules/password-hash');

const pool = new Pool({
  user: 'me',
  host: 'localhost',
  database: 'api',
  password: 'password',
  port: 5432,
})

const createUser = (req, res) => {
  const { nickname,passwordSignUp,emailSignUp } = req.body;
  pool.query('SELECT * FROM users WHERE nickname=$1 OR email=$2',[nickname,emailSignUp],(error,results) => {

    if (!results.rows[0]) {
      pool.query('INSERT INTO users (nickname,password,email) VALUES ($1, $2, $3)', [nickname, passwordHash.generate(passwordSignUp) ,emailSignUp], (error2, results2) => {
        if (error2) {
          throw error2;
        }
        else {
          req.session.success =true;
          req.session.username=nickname;
          req.session.userEmail=emailSignUp;
          res.redirect('/');
        }
      })
    }
    else{
      req.session.success = false;
      var errors = [{msg:'There already exist user with such email or nickname'}]
      req.session.errors = errors;
      res.redirect('/');
    }
  })


}
const validateUserByLoginEndPassword = (req,res) => {
  const {passwordLogin,emailLogin} = req.body;

  pool.query('SELECT * FROM users WHERE email=$1',[emailLogin],(error,results) => {
    if (error) {
      throw error;
    }
    else {
      if (results.rows[0]) {
        if (passwordHash.verify(passwordLogin,results.rows[0].password)) {
          req.session.success =true;
          req.session.username=results.rows[0].nickname;
          req.session.userEmail=results.rows[0].email;
          res.redirect('/');
        }
        else {
          req.session.success =false;
          var errors = [{msg:'Incorrect password'}]
          req.session.errors = errors;
          console.log(req.session.errors[0].msg);
          res.redirect('/');
        }
      }
      else {
        req.session.success =false;
        var errors = [{msg:'There is no user with email: ' + emailLogin}]
        req.session.errors = errors;
        res.redirect('/');
      }
    }


  })
}

const createUserSubject =(req,res) =>{
  const { username } = req.session;
  const { inputSubject } =req.body;
  pool.query('INSERT INTO notes(author,lesson) VALUES($1,$2)',[username,inputSubject],function (error,results) {
    if (error) {

    }
    else {
      res.redirect('/');
    }
  })

}

const getUserSubjects = (req,res) => {
  var subjArr=[]
  const { username } = req.session;
  pool.query('SELECT DISTINCT lesson FROM notes WHERE author=$1',[username],function (error,results) {
    if (error) {

    }
    else {
      for (var i = 0; i < results.rows.length; i++) {
        subjArr.push(results.rows[i].lesson)
      }
      res.render('index', { title: 'Form Validation', success: req.session.success, errors:req.session.errors, username:req.session.username, email:req.session.userEmail, subjects:subjArr});
    }
  })
}

const getUserSubjectNotes = (req,res) => {
  var notesArr=[]
  const { username } = req.session;
  const subject = req.params.subjId;
  pool.query('SELECT DISTINCT title FROM notes WHERE author=$1 AND lesson=$2 AND title IS NOT NULL',[username,subject],function (error,results) {
    if (error) {

    }
    else {
      for (var i = 0; i < results.rows.length; i++) {
        notesArr.push(results.rows[i].title)
      }
      res.render('subjNotes', {title: subject,
      notes:notesArr,
      errors:req.session.errors,
      });
    }
  })
}

module.exports = {
  createUser,
  validateUserByLoginEndPassword,

  getUserSubjects,
  createUserSubject,

  getUserSubjectNotes
}
