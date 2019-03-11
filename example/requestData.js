const {Sproof}  = require('../index.js');
const config  = require ('./config/config_receiver');

let sproof = new Sproof(config);

//sproof.on('setting:update', console.log);


let logResponse = (err,res) => err ? console.log(err) : console.log(res);


//sproof.getEvents({id : '0xac56a7953982dc8b066cfdcfd59a6b7d380c632aafd272a7da1863bfd49b3496'}, logResponse);

//sproof.getDocuments({}, logResponse);

// sproof.getEvents({}, logResponse);
// sproof.getProfiles({id: '0x86ec4f0b4e8ecc2f13f8ad86d9f6c2db30648b96'}, logResponse);
// sproof.getReceivers({}, logResponse);
// sproof.getState({}, logResponse);
sproof.getRegistrations({per_page: 1}, logResponse);