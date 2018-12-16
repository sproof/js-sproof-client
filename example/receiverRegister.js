const config = require('./config_receiver.js');
const config_issuer = require('./config_issuer.js');
const {Sproof, Receiver, Document, Card}  = require('../index.js');
const utils = require('sproof-utils');

let sproof = new Sproof(config);
let token = '0xasdf';
let issuer = config_issuer.credentials.publicKey;

sproof.message.sendRegister(token, config.credentials.publicKey, issuer,(err, res) => {
  console.log(err)
  console.log(res);
});


//
// //console.log(r1);
// [...Array(1000).keys()].map( i => {
//   sproof.push(r1, (err,res) => {
//     console.log(res.body);
//     console.log(err);
//   });
// });

//
// sproof.registerDocument(c);
//
// sproof.commit((err, res) => {
//   if (err) return console.error(JSON.stringify(err, null, '\t'));
//   else console.log(res.body);
// });