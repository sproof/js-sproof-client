const config_issuer = require('./config/config_issuer.js');
const { Sproof }  = require('../index.js');

let sproof = new Sproof(config_issuer);

// let credentials = sproof.newAccount();
//
// console.log(credentials);
//
// console.log("Create a config file and fill this account with ether ");
// process.exit(1);


let registerProfileEvent = sproof.registerProfile({
  name: 'new sproof account',
  profileText: 'Sproof Test Account',
  image: 'Qma34dB4B4N4eS5ibBkwtjTSTNCRdJrVY6E25DFuFuU8Sd'
});

sproof.commit((err, res) => {
  if (err) console.error(err);
  else console.log(res);
});
