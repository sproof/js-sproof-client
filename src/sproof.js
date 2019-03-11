const utils = require ('sproof-utils');
const Receiver = require ('./receiver');
const Message = require ('./message');
const Api = require ('./api');

class Sproof {
  constructor(config = {}) {

    if (config.credentials){
      if (!config.credentials.privateKey && config.credentials.sproofCode){
        let credentials = utils.restoreCredentials(config.credentials.sproofCode);
        config.credentials = {...config.credentials, ...credentials }
      }
    }

    this.config = config;

    this.events = [];

    this.message = new Message(config, this);
    this.api = new Api(config);

    this.getHash = utils.getHash;
    this.getCredentials = utils.getCredentials;

  }

  registerProfile(data){
    this.addEvent({
      eventType: 'PROFILE_REGISTER',
      data
    });
    return data;
  }


  updateProfile(data){
    this.addEvent({
      eventType: 'PROFILE_UPDATE',
      data
    });
  }

  confirmProfile(profileId, value){
    this.addEvent({
      eventType: 'PROFILE_CONFIRM',
      data :{
        to: profileId,
        value
      }
    });
  }

  revokeProfile(reason){
    this.addEvent({
      eventType: 'PROFILE_REVOKE',
      data :{
        reason
      }
    });
  }

  registerDocument(document) {
    this.addEvent({
      eventType: 'DOCUMENT_REGISTER',
      data: {
        ...document.toJSON()
      }
    })
  }

  revokeDocument(documentHash, reason) {
    this.addEvent({
      eventType: 'DOCUMENT_REVOKE',
      data: {
        reason,
        documentHash
      }
    })
  }

  addDocumentReceiver(documentHash, receiverId){
    this.addEvent({
      eventType: 'DOCUMENT_RECEIVER_ADD',
      data: {
        documentHash,
        receiverId
      }
    })
  }

  revokeDocumentReceiver(receiverId, reason) {
    this.addEvent({
      eventType: 'DOCUMENT_RECEIVER_REVOKE',
      data: {
        receiverId,
        reason
      }
    })
  }


  addEvent(event){
    this.events.push(event);
  }

  registerPremiumUser(data, callback){
    this.api.registerPremiumUser(data,callback);
  }

  getUser(callback) {
    this.api.get('user', {}, callback);
  }

  getState(callback) {
    this.api.get('state', {} , callback);
  }

  getEvents(params, callback) {
    this.api.get('events', params, callback);
  }

  getTransactions(params, callback) {
    this.api.get('transactions', params, callback);
  }

  getProfiles(params = {}, callback) {
    this.api.get('profiles', params, callback);
  }

  getReceivers(params, callback) {
  this.api.get('receivers', params, callback);
  }

  getRegistrations(params, callback) {
    this.api.get('registrations', params, callback);
  }

  getDocuments(params, callback) {
    this.api.get('documents', params, callback);
  }

  getValidation(id, callback) {
    this.api.get('verification', {id}, callback);
  }

  on (event, fun) {
    this.api.on(event,fun)
  }

  commitPremium(callback){
    this.api.getHash(this.events, (err, res) => {
        if (err) return callback(err);
        else {
          let { hashToRegister, hash } = res;
          let signature = utils.sign(hashToRegister, this.config.credentials.privateKey);
          this.api.submitPremium(this.events, this.config.credentials.address, hashToRegister, signature, (err, res) => {
              if (err) return callback(err);
              this.events = [];
              return callback(null, {...res, hash});
          });
        }
    });
  }

  commit(callback){
    this.api.getRawTransaction(this.events, (err, res) => {
      if (err) return callback(err);
      else {
        let { hash, rawTransaction, message } = res;
        let { transactionHash, signedTx } = utils.signTx(rawTransaction, this.config.credentials.privateKey);
        this.api.submit(this.events, signedTx, transactionHash, (err, res) => {
          if (res && res.blockHash)
            this.events = [];

          callback(err,res);
        });
        //let signature = utils.sign(hashToRegister, this.config.credentials.privateKey);
        //this._submit(this.events, hashToRegister, signature, callback);
      }
    });
  }

  newAccount() {
    let credentials = utils.getCredentials();
    this.config.credentials = credentials;
    return credentials;
  }

  restoreAccount(mnemonic) {
      let credentials = utils.restoreCredentials(mnemonic);
      this.config.credentials = credentials;
      return credentials;
  }

  verify(sharedReceiver, callback) {
    let restoredReceiver = Receiver.restore(sharedReceiver);
    let validationResult = Receiver.validate(restoredReceiver, sharedReceiver.signature);

    if (!validationResult.valid)
      return callback(null, {valid: false, message: 'Receivers signature is invalid.'});

    this.getValidation(validationResult.id, (err, res) => {
      if (err) return callback(err);
      return callback(null, {...res, receiver: validationResult})
    });
  }

  getMessages(params, callback) {
    this.message.getMessages(params, callback);
  }

  uploadFile(buf, callback) {
    this.api.uploadFile(buf, callback);
  }
}

module.exports = Sproof;