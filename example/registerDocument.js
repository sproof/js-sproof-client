const config = require('./config/config_issuer');
const { Sproof, Registration }  = require('../index.js');

let sproof = new Sproof(config);

//register profile first

let documentHash = '0xf1b1c24a69c4c726c8b1ec42ed924b7305f3eb53949fc2f64dd1ef7d0ee9b0e5';
// documentHash = sproof.getHash(>>string or buffer <<<);

let registration  = new Registration({
  documentHash,
  validFrom: undefined, //unix timestamp
  validUntil: undefined, //unix timestamp
});

sproof.registerDocument(registration);


sproof.commit((err, res) => {
  if (err) console.error(err);
  else console.log(res);
});
