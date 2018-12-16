const config_issuer = require('./config_issuer.js');
const config_receiver  = require ('./config_receiver');
const {Sproof}  = require('../index.js');
const io = require('socket.io-client');

let sproof = new Sproof(config_issuer);

sproof.on('setting:update', console.log);
//
// const socket = io('http://localhost:3000');
// socket.on('settin')