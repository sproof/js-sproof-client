const Sproof = require('../sproof');
const utils = require ('sproof-utils');


class Message {
  constructor(config, sproof){
    this.sproof = sproof;
    this.config = config;
  }

  getMessages (params, callback) {
    this.sproof.api.get('messages', params, (err, res) => {
      if (err) return callback(err);
      if (res.result) {
        if (Array.isArray(res.result))
        res.result = res.result.map(m => {
          m.data ? m.data = utils.decrypt(this.config.credentials.privateKey, m.data) : {};
          return m
        });
        else{
          res.result.data = res.result.data ? utils.decrypt(this.config.credentials.privateKey, res.result.data) : {}
        }
      }
      callback(null, res);
    })
  }

  sendMessage (data, type, toPublicKey, callback) {
    let encryptedData = utils.encrypt(toPublicKey, data);
    this.sproof.api.post('messages', {data: encryptedData, type, to : utils.publicKeyToAddress(toPublicKey), from: this.config.credentials.address}, callback);
  }

  sendVerify (sharedReceivers, token, verifierPublicKey, callback) {
    if (!Array.isArray(sharedReceivers))
      throw new Error('First argument must be an array');

    let r = sharedReceivers.first();
    if (!r.state)
      throw new Error('Receiver has not state');

    this.sendMessage({sharedReceivers, token}, 'VERIFY', verifierPublicKey, callback);
  }

  sendRegister (token, publicKey, issuerPublicKey, callback) {
    this.sendMessage({token, publicKey}, 'REGISTER', issuerPublicKey, callback);
  }

  sendIssue (receiver, callback) {
    if (!receiver.state)
      throw new Error('Receiver has not state');
    let jsonReceiver = receiver.toJSON();
    this.sendMessage(jsonReceiver, 'ISSUE', receiver.state.publicKey, callback);
  }
};

module.exports = Message;