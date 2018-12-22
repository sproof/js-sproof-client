const s = require('../src/');
const s1 = require('../lib/');

let sproof = new Sproof();

sproof.getProfiles({}, (err, res) => {
  console.log(res);
  console.log(err);
});