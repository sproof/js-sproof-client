const config = require('./config.js');
const {Sproof, Receiver, Card}  = require('./index.js');

let sproof = new Sproof(config);

//Client Side code
let { user }  = props;
let qrcode = sproof.getQRCode(db.getUser(user.id));
//<img data={qrcode}/>


//Request Issue
get('register/:id', (res, req) => {
  let user = db.getUser(req.params.id);

  let card = new Card({
    data: {
        title: "Membership Card",
        subtitle: 'Gold',
        image: 'string'
    },
    validFrom: +new Date,
    validUntil: undefined,
    document: data,
    dependencies: [],
    receivers: []
  }, config.cardSchema);

  let receiver = new Receiver({
    publicKey: req.params.publicKey
  });

  receiver.setName(user.name);
  receiver.setDateOfBirth(user.dateOfBirth);
  receiver.setImage(user.image);
  receiver.setCardNumber(user.number);

  receiver.setAttribute('placeOfBirth', 'wels');

  card.addReceiver(receiver);

  console.log(receiver);


  sproof.commit(card, (err,res) => {
    let cardId = res.id; //   hash of registration event
  });
});