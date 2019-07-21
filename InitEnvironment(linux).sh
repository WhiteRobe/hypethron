npm --registry https://registry.npm.taobao.org install

echo // Configure Your Redis >> ./server/dao/redis-configure.js
echo // --- // >> ./server/dao/redis-configure.js
echo const REDIS_CONFIG = { >> ./server/dao/redis-configure.js
echo   port: 6379, // Redis port >> ./server/dao/redis-configure.js
echo   host: '127.0.0.1', // Redis host, like '192.168.1.101' >> ./server/dao/redis-configure.js
echo   family: 4, // 4 (IPv4) or 6 (IPv6) >> ./server/dao/redis-configure.js
echo   password: 'password', // Your password >> ./server/dao/redis-configure.js
echo   db: 0, // Database index to use. >> ./server/dao/redis-configure.js
echo   connectionName: "default" // Connection name. >> ./server/dao/redis-configure.js
echo }; >> ./server/dao/redis-configure.js
echo module.exports = REDIS_CONFIG; >> ./server/dao/redis-configure.js

echo service_name: travis-pro >> .coveralls.yml
echo repo_token: $Token >> .coveralls.yml

echo // Configure your MySQL >> ./server/dao/mysql-configure.js
echo // --- // >> ./server/dao/mysql-configure.js
echo const MYSQL_CONFIGURE = { >> ./server/dao/mysql-configure.js
echo   host: '127.0.0.1', >> ./server/dao/mysql-configure.js
echo   port: 3306, >> ./server/dao/mysql-configure.js
echo   user: 'root', >> ./server/dao/mysql-configure.js
echo   password: 'password', >> ./server/dao/mysql-configure.js
echo   database: 'my_database', >> ./server/dao/mysql-configure.js
echo   connectionLimit : 10 >> ./server/dao/mysql-configure.js
echo }; >> ./server/dao/mysql-configure.js
echo module.exports = MYSQL_CONFIGURE; >> ./server/dao/mysql-configure.js