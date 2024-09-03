
let config = {}

config.api      = {};
config.api.host  = process.env.API_HOST ;
config.api.accountsUrl  = process.env.ACCOUNTS_URL;

if(!config.api.host)
    throw new Error(`'API_HOST' env variable not set, please update env for eg 'https://api.cbddev.xyz'`)

if(!config.api.accountsUrl)
    throw new Error(`'ACCOUNTS_URL' env variable not set, please update env for eg 'https://accounts.cbddev.xyz'`)

config.encryptionPassword   = process.env.ENCRYPTION_PASSWORD

export default config;
