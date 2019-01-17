const config_issuer = require('./config/config_issuer.js');
const config_receiver  = require ('./config/config_receiver');

const {Sproof, Receiver, Card}  = require('../index.js');

let sproof = new Sproof(config_issuer);

let c = new Card({
  title: 'Sproof Test ' + new Date().getTime(),
  subtitle: 'Card Template',
  attributes: ['name', 'email']
});


[...Array(10).keys()].map(i => {
  let r1 = new Receiver({
    address: config_receiver.credentials.address,
    publicKey: config_receiver.credentials.publicKey,
  });
  r1.addAttribute('name', 'Clemens');
  r1.addAttribute('email', 'clemens@sproof.it');
  c.addReceiver(r1);
});

sproof.registerDocument(c);

sproof.commitPremium((err, res) => {
  if (err) return console.error(err);
  else console.log(res);
})
