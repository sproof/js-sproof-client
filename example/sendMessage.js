const config = require('./config.js');
const {Sproof, Receiver, Document, Card}  = require('../index.js');

const utils = require('sproof-utils');

let credentials = utils.getCredentials();

//console.log(credentials);

let sproof = new Sproof({ ...config, credentials});

sproof.registerProfile({
  name: 'Profile Test 1235',
  profileText: 'Example profile text',
  image: 'Qma34dB4B4N4eS5ibBkwtjTSTNCRdJrVY6E25DFuFuU8Sd'
});

sproof.commitPremium((err, res) => {
  if (err) return console.error('Error: ' + JSON.stringify(err, null, '\t'));
  else console.log(res.body);

});