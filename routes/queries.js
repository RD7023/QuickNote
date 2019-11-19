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
  const { nickname,password,email } = request.body
  pool.query('INSERT INTO users (nickname,password,email) VALUES ($1, $2, $3)', [nickname, passwordHash.generate(password) ,email], (error, results) => {
    if (error) {
      throw error;
    }
    response.status(201);
  })
}

module.exports = {
  createUser,
}
