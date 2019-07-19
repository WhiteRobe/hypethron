// Configture Your Redis 
const REDIS_CONFIG = { 
    port: 6379, // Redis port
    host: "127.0.0.1", // Redis host
    family: 4, // 4 (IPv4) or 6 (IPv6)
    password: "password", // Your password
    db: 0, // Database index to use.
    connectionName: "default" // Connection name.
}; 
module.exports = REDIS_CONFIG; 
