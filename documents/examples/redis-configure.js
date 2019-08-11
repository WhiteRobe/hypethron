// Configure Your Redis
// --- //
const REDIS_CONFIG = {
  port: 6379, // Redis port
  host: "127.0.0.1", // Redis host
  family: 4, // 4 (IPv4) or 6 (IPv6)
  password: "password", // Your password
  db: 0, // Database index to use.
  connectionName: "default", // Connection name.
  poolOption:{ // @See https://www.npmjs.com/package/generic-pool
    max: 10, // maximum size of the pool
    min: 2 // minimum size of the pool
  }
};
module.exports = REDIS_CONFIG; 
