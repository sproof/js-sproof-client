const config = require('./config_issuer.js');
const {Sproof, Receiver, Document, Card}  = require('../index.js');
const fs = require ('fs');

const utils = require('sproof-utils');

let credentials = utils.getCredentials();

//console.log(credentials);

let sproof = new Sproof({ ...config, credentials});

let registerEvent = sproof.registerProfile({
  name: 'sproof debug',
  profileText: 'Sproof test account',
  image: 'Qma34dB4B4N4eS5ibBkwtjTSTNCRdJrVY6E25DFuFuU8Sd'
});
console.log(credentials);
console.log(registerEvent);

sproof.commitPremium((err, res) => {
  if (err) return console.error(err);
  else console.log(res);
});
