// Configure your MySQL
// --- //
const MYSQL_CONFIGURE = {
  host: '127.0.0.1',
  port: 3306,
  user: 'root',
  password: 'password',
  database: 'my_database',
  connectionLimit : 10 // pool size
};
module.exports = MYSQL_CONFIGURE;
