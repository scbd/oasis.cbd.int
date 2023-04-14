
let config = {}

config.api      = {};
config.api.host  = process.env.API_HOST || 'https://api.cbddev.xyz';

config.encryptionPassword   = process.env.ENCRYPTION_PASSWORD

export default config;
