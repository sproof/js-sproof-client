const utils = require('sproof-utils');


let createCredentials =  (credentials) => {
  let signature;

  let timestamp = Math.round(new Date().getTime()/1000);
  if (credentials.address)
    signature = utils.sign(credentials.address+":"+timestamp, credentials.privateKey);

  return {
    address: credentials.address,
    timestamp,
    signature
  }
};

module.exports = createCredentials;

