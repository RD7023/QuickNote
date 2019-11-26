const Pool = require('pg').Pool
var passwordHash = require('../node_modules/password-hash');

const pool = new Pool({
  user: 'me',
  host: 'localhost',
  database: 'api',
  password: 'password',
  port: 5432,
})

const createUser = (request, response) => {
  const { nickname,passwordSignUp,emailSignUp } = request.body;
  pool.query('SELECT * FROM users WHERE nickname=$1 OR email=$2',[nickname,emailSignUp],(error,results) => {

    if (!results.rows[0]) {
      pool.query('INSERT INTO users (nickname,password,email) VALUES ($1, $2, $3)', [nickname, passwordHash.generate(passwordSignUp) ,emailSignUp], (error2, results2) => {
        if (error2) {
          throw error2;
        }
        else {
          request.session.success =true;
          request.session.username=nickname;
          request.session.userEmail=emailSignUp;
          response.redirect('/');
        }
      })
    }
    else{
      request.session.success = false;
      var errors = [{msg:'There already exist user with such email or nickname'}]
      request.session.errors = errors;
      response.redirect('/');
    }
  })


}
const validateUserByLoginEndPassword = (request,response) => {
  const {passwordLogin,emailLogin} = request.body;

  pool.query('SELECT * FROM users WHERE email=$1',[emailLogin],(error,results) => {
    if (error) {
      throw error;
    }
    else {
      if (results.rows[0]) {
        if (passwordHash.verify(passwordLogin,results.rows[0].password)) {
          request.session.success =true;
          request.session.username=results.rows[0].nickname;
          request.session.userEmail=results.rows[0].email;
          response.redirect('/');
        }
        else {
          request.session.success =false;
          var errors = [{msg:'Incorrect password'}]
          request.session.errors = errors;
          console.log(request.session.errors[0].msg);
          response.redirect('/');
        }
      }
      else {
        request.session.success =false;
        var errors = [{msg:'There is no user with email: ' + emailLogin}]
        request.session.errors = errors;
        response.redirect('/');
      }
    }


  })
}

const createSubject =(request,response) =>{
  const { username } = request.session;
  const { inputSubject } =request.body;
  pool.query('INSERT INTO notes(author,lesson) VALUES($1,$2)',[username,inputSubject],function (error,results) {
    if (error) {

    }
    else {
      response.redirect('/');
    }
  })

}

const getUserSubject = (request,response) => {
  var subjArr=[]
  const { username } = request.session;
  pool.query('SELECT DISTINCT lesson FROM notes WHERE author=$1',[username],function (error,results) {
    if (error) {

    }
    else {
      for (var i = 0; i < results.rows.length; i++) {
        subjArr.push(results.rows[i].lesson)
      }
      response.render('index', { title: 'Form Validation', success: request.session.success, errors:request.session.errors, username:request.session.username, email:request.session.userEmail, subjects:subjArr});
    }
  })
}

module.exports = {
  createUser,
  validateUserByLoginEndPassword,

  getUserSubject,
  createSubject

}
