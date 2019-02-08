const { Sproof }  = require('../index.js');

let sproof = new Sproof({
  uri: 'https://api.sproof.it/',
});

let credentials = sproof.newAccount();

let registerProfileEvent = sproof.registerProfile({
  name: 'new sproof account',
  profileText: 'Sproof Test Account',
  image: 'Qma34dB4B4N4eS5ibBkwtjTSTNCRdJrVY6E25DFuFuU8Sd'
});

sproof.commitPremium((err, res) => {
  if (err) console.error(err);
  else console.log(res);
});
