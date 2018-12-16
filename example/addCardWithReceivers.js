const config_issuer = require('./config_issuer.js');
const config_receiver  = require ('./config_receiver');
const {Sproof, Receiver, Document, Card}  = require('../index.js');
const utils = require('sproof-utils');

let sproof = new Sproof(config_issuer);

//sproof.registerProfile({name: 'test'})

let run = (y) => {
  console.log("RUN " + y)
  let c = new Card({
    title: 'Sproof Test ' + new Date().getTime(),
    subtitle: 'Template',
    attributes: ['name', 'email']
  });


  [...Array(345).keys()].map(i => {
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
    if (err) return console.error(JSON.stringify(err, null, '\t'));
    else {
      console.log(res);
      process.nextTick(() => run(y+1));
    }

  });
}

run(0);