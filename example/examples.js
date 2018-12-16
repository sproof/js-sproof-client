const config = require('./config.js');
const {Sproof, Receiver, Document, Card}  = require('../index.js');
const fs = require ('fs');
//
// let sproof = new Sproof(config);
//
// let rc = {
//   publicKey: "0x19127ec882ee9ab88d914b085b0b47d61c1f8e3b966b4a0e71c61d17b36ff75ccee8d82c19851f34e7e07e9f31cb4ab0d7c984e458019740dbc41c8badd91b01",
//   address: "0xc0ba00f8ca7df7a71daf918ef0d845dbcca11a17",
//   privateKey: "0x992850405a2cc78dd160b31d92958136edd4c8163c62ee8f4430b1c626a2867c"
// }
//
// let sharedReceiver = {
//   rootValue: '0x19127ec882ee9ab88d914b085b0b47d61c1f8e3b966b4a0e71c61d17b36ff75ccee8d82c19851f34e7e07e9f31cb4ab0d7c984e458019740dbc41c8badd91b01;0xd0290bf4ac82c91050104afdf85ed9ac07e51d5dd5799d08ff9d6a12bdf50073;null;null;0x089c2e0306758f54777503e0671067baf2b18628e63e284f9682484af5f11cd9',
//   attributesValues: 'email:0xa67c63eab8c23828f6c77ce3a4642dfac53b80467ae579b282b7f901462c635a;name:0xb11f73c27f1e00ff20eeac7900fd432f85bd3af33e5ae9a3d36a583ad630bef6',
//   attributes:
//     [ { value: 'Clemens',
//       salt: '0x0149658147b4d7f75046f760edc85571d6c27b42fcbd23a7a404bf2d2272ec07' } ],
//   signature:
//     { r: '0xfc795e6a625146ddfe0b18503be3ea18fd1fc9da927a4368ccecf8bd65ad424d',
//       s: '0x124ad61c772e90bf0fed88bec80386ceeecc36bf133bacd527d17c27be1c88d6',
//       v: 27 } };
//
//
//
// sproof.registerProfile({
//   name: 'Profile Test 123',
//   profileText: 'profiletext123',
//   image: '0x1234'
// });
// //
// //
// // let documentHash = '0xf1b1c24a69c4c726c8b1ec42ed924b7305f3eb53949fc2f64dd1ef7d0ee9b0e5';
// //
// //
// // let doc = new Document(documentHash, Math.round((new Date().getTime()/1000)), undefined);
// //
// // let r1 = new Receiver({
// //   publicKey: '0x0ebd0e35d69620cade368c17f866a6d0ca57f4a8b8eb6259d36863c4914bdeea88d2c5a9fe238fed555d5ae613b9417a6b0169e1c67995b107e2eaf930c93cca'
// // });
// //
// // r1.addName('Clemens Brunner');
// // r1.addDateOfBirth('1992-05-30');
// //
// // doc.addReceiver(r1);
// //
// // // console.log(r1.toString());
// // //
// //sproof.registerDocument(doc);
// //
// //
// // let r2 = new Receiver({
// //   publicKey: '0x0ebd0e35d69620fade368c17f866a6d0ca57f4a8b8eb6259d36863c4914bdeea88d2c5a9fe238fed555d5ae613b9417a6b0169e1c67995b107e2eaf930c93cca'
// // });
// //
// // r2.addName('Max Mustermann');
// // r2.addDateOfBirth('1990-10-10');
// //
// //
// // sproof.addDocumentReceiver(documentHash, r2.getId());
// //
// //
// // sproof.revokeDocumentReceiver("0x1ee7e9364344c027e03ca12f89cadcce3e61a392bee4b22b1badb7b84dfeb0a1", 'no comment');
// //
// // console.log(sproof.events)
//
// let c = new Card({title: 'sproof card', subtitle: 'try it', attributes: ['name', 'email']});
// //c.addReceiver()
// let cle = new Receiver({
//   address: rc.address,
// });
// cle.addAttribute('name', 'Clemens');
// cle.addAttribute('email', 'clemens@sproof.it');
// // console.log (cle.share(rc.privateKey, ['name']));
//
// c.addReceiver(cle);
//
// //c.addReceiver(Receiver.restore(sharedReceiver));
// //sproof.registerDocument(c);
//
// //sproof.revokeDocumentReceiver('0x2e25c290e5975abd1a95565dc329ebe9557d0a45edabfcfb597aa2e6c7c72907', 'tst')
//
// //
// // sproof.verify(sharedReceiver, (err, res) => {
// //   if (err) return console.error(JSON.stringify(err, null, '\t'));
// //   else console.log(JSON.stringify(res, null, '\t'));
// // //
// // });
//
// // sproof.commit((err, res) => {
// //   if (err) return console.error(JSON.stringify(err, null, '\t'));
// //   else console.log(res.body);
// //
// // });
//
// // let r = new Receiver(exampleReceiver);
// // console.log(r.getId());
//
// // sproof.confirmProfile('0x0034cb84a21ece60584eda02547b9f7b795bd07b', true);
// // sproof.confirmProfile('0x0034cb84a21ece60584eda02547b9f7b795bd07b', false);
// // sproof.updateProfile({name: 'updated test profile'});
// // sproof.revokeProfile("Company closed");
// // sproof.addCard(new Card({title: 'Membership Card Sproof' }));
// //
// //
// //sproof.revokeDocument('0xf1b0c24a69c4c726c8b1ec42ed924b7305f3eb53949fc2f64dd1ef7d0ee9b0e5', 'Document is no longer valid');
//
// // sproof.commit((err, res) => {
// //   if (err) return console.error(JSON.stringify(err, null, '\t'));
// //   else console.log(res.body);
// //
// // });
//
// // sproof.getEvents({id: '0xcdb306326a4ed9927c0928ebf04765595805d48ab36a1f957aa6eeed04127e25'}, (err, res ) => {
// //     console.log(res);
// //     console.log(err);
// // });
// //
// // sproof.getTransactions({}, (err, res ) => {
// //   console.log(res);
// //   console.log(err);
// // });
//
// /*
// sproof.getProfiles({}, (err, res ) => {
//   console.log(res);
//   console.log(err);
// });*/
//
//
// let receiver = new Receiver({address : rc.address, validUntil: new Date().getTime() });
// sharedReceiver = receiver.share(rc.privateKey, []);
// let restoredReceiver = Receiver.restore(sharedReceiver);
// console.log(restoredReceiver);


let sproof = new Sproof(config);


//sproof.confirmProfile('', true);

// sproof.commit((err, res) => {
//   if (err) return console.error(JSON.stringify(err, null, '\t'));
//   else console.log(res.body);
// });

sproof.commit((err, res) => {
  if (err) return console.error(JSON.stringify(err, null, '\t'));
  else console.log(res.body);
});