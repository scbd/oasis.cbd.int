
let config = {}

config.api      = {};
config.api.url  = process.env.API_URL || 'https://api.cbddev.xyz';

config.encryptionPassword   = process.env.ENCRYPTION_PASSWORD

module.exports = config;
