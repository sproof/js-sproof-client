const {Sproof, Receiver, Registration, Card}  = require ('./src');

let e = {
  Sproof,
  Receiver,
  Registration,
  Card
};

//if(typeof window === "undefined") window._s = e;

module.exports = e;
