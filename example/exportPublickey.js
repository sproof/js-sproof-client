const config_issuer = require('./config/config_issuer.js');
const { Sproof }  = require('../index.js');

let sproof = new Sproof(config_issuer);

console.log(sproof.getWebAppPublicKey());