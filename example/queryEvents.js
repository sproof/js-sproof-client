const {Sproof}  = require('../index.js');
const config  = require ('./config/config_receiver');

let sproof = new Sproof(config);


let logResponse = (err,res) => err ? console.log(err) : console.log(res);

//get Events from a specific address
sproof.getEvents({from: '0x4e19347efd399a759268880c2cdcb6836b744597', per_page: 50}, logResponse);


sproof.getEvents({id : '0xac56a7953982dc8b066cfdcfd59a6b7d380c632aafd272a7da1863bfd49b3496'}, (err,event) => {
  if (err) return console.error(err);
  sproof.getTransactions({id: event.transaction}, (err, tx) => {
    console.log('Transactions Hash: ' + tx._id);
    console.log('IPFS Hash: ' + tx.dhtHash);
    console.log('Block Number: ' + tx.blockNumber);
    console.log('Sender: ' + tx.from);
  })
});
