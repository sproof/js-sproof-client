const { Sproof, Registration }  = require('../index.js');
const config = require ('./config/config_issuer');
const fs = require('fs');

let sproof = new Sproof(config);


//let data = fs.readFileSync('./example.pdf');
let data = fs.readFileSync('./bilder1.zip');


sproof.uploadFile(data, (err,res) => { //upload file to ipfs
  if (res) {
    console.log(res)
    let documentHash = sproof.getHash(data); //calculate hash of the file

    let registration  = new Registration({
      documentHash,
      name: 'mytest',
      locationHash: res.hash, //add ipfs location hash
      validFrom: undefined, //unix timestamp
      validUntil: undefined, //unix timestamp
    });

    sproof.registerDocument(registration);

    sproof.commit((err, res) => {
      if (err) console.error(err);
      else console.log(res);
    });
  }else
    console.error(err)
});