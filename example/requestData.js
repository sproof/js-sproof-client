const {Sproof}  = require('../index.js');

let sproof = new Sproof({uri: 'https://www.sproof.it/'});
sproof.newAccount();

sproof.on('setting:update', console.log);


let logResponse = (err,res) => err ? console.log(err) : console.log(res);

sproof.getDocuments({}, logResponse);
sproof.getTransactions({}, logResponse);
sproof.getEvents({}, logResponse);
sproof.getProfiles({}, logResponse);
sproof.getReceivers({}, logResponse);
sproof.getState({}, logResponse);