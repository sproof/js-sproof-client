const config_issuer = require('./config/config_issuer.js');
const { Sproof }  = require('../index.js');

let sproof = new Sproof(config_issuer);

// let credentials = sproof.newAccount();
//
// console.log(credentials);
//
// console.log("Create a config file and fill this account with ether ");
// process.exit(1);


let registerProfileEvent = sproof.updateProfile({
  name: 'public dev account',
  profileText: 'This is a dev profile. Credentials can be found on github.',
  image: 'QmSAbnUSPHAGFJFKkP2eqJd4bbgzMmq6ApWUVcE9qebHLS'
});

sproof.commit((err, res) => {
  if (err) console.error(err);
  else console.log(res);
});
