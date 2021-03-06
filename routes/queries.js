const Pool = require('pg').Pool;

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
      console.log(error);
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
      console.log(error);
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
      console.log(error);
    }
    else {
      for (var i = 0; i < results.rows.length; i++) {
        notesArr.push(results.rows[i].title)
      }
      res.render('subjectNotes', {title: subject,
      notes:notesArr,
      errors:req.session.errors,
      });
    }
  })
}
const createUserSubjectNotes = (req,res) => {
  const { username } = req.session;
  const subject  = req.params.subjId;
  const { inputNoteTitle } = req.body;

  pool.query('INSERT INTO notes(author,lesson,title) VALUES($1,$2,$3)',[username,subject,inputNoteTitle],function (error,results) {
    if (error) {
      console.log(error);
    } else {
      res.redirect('/'+subject);
    }
  })
}

const getUserNote = (req,res) => {
  const { username } = req.session;
  const subject = req.params.subjId;
  const title = req.params.noteId;

  pool.query('SELECT text,photo FROM notes WHERE author=$1 AND lesson=$2 AND title=$3 ',[username,subject,title],function (error,results) {

    if (error) {
      console.log(error);
    } else {
      if (results.rows[0]) {
        if (results.rows[0].photo||results.rows[0].text) {
          console.log(results.rows[0]);
          text=results.rows[0].text;
          photo=results.rows[0].photo;
          if (photo) {
            photo=`/uploads/${photo}`;
          }
          res.render('note', {title: title,
          text:text,
          photo:photo,
          subject:subject,
          errors:req.session.errors
          });
        }
        else {
          res.render('note', {title: title,
          subject:subject,
          text:' ',
          errors:req.session.errors
          });
        }
      }
      else {

          res.render('note', {title: title,
          subject:subject,
          text:' ',
          errors:req.session.errors
          });

      }

    }
  })
}

const uploadPhoto = (req,res) => {
  const { username } = req.session;
  const subject = req.params.subjId;
  const title = req.params.noteId;
  const photo = req.file.filename;
  pool.query('UPDATE notes SET photo=$1 WHERE title=$2 AND lesson=$3 AND author=$4',[photo,title,subject,username],function (error,results) {
    if (error) {
      console.log(error);
    } else {
      res.redirect('/'+subject+'/'+title);
    }
  })
}

const saveNote = (req,res) => {
  const { username } = req.session;
  const subject = req.params.subjId;
  const title = req.params.noteId;
  const text = req.body.text;
  pool.query('UPDATE notes SET text=$1 WHERE title=$2 AND lesson=$3 AND author=$4',[text,title,subject,username],function (error,results) {
    if (error) {
      console.log(error);
    } else {
      res.redirect('/'+subject+'/'+title);
    }
  })
}

const saveTextFromPhoto = (req,res,data) => {
  const { username } = req.session;
  const subject = req.params.subjId;
  const title = req.params.noteId;

  pool.query('UPDATE notes SET text=$1 WHERE title=$2 AND lesson=$3 AND author=$4',[data,title,subject,username],function (error,results) {
    if (error) {
      console.log(error);
    } else {
      res.redirect('/'+subject+'/'+title);
    }
  })

}

module.exports = {
  createUser,
  validateUserByLoginEndPassword,

  getUserSubjects,
  createUserSubject,

  getUserSubjectNotes,
  createUserSubjectNotes,

  getUserNote,
  uploadPhoto,
  saveNote,
  saveTextFromPhoto
}
