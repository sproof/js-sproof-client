const utils = require ('sproof-utils');
const Receiver = require ('./receiver');
const Message = require ('./message');
const Api = require ('./api');
const User = require ('./user');

const _ = require ('lodash');
const eventsSchema = require ('sproof-schema').eventsSchema;


class Sproof {
  constructor(config = {}) {

    if (config.credentials){
      if (!config.credentials.privateKey && config.credentials.sproofCode){
        let credentials = utils.restoreCredentials(config.credentials.sproofCode);
        config.credentials = {...config.credentials, ...credentials }
      }
    }


    this.maxBulkEntries = (eventsSchema.properties.events.items.oneOf.find(e => e.title === 'Register multiple documents')).properties.data.maxItems;
    this.maxEvents = eventsSchema.properties.events.maxItems;

    this.config = config;

    this.events = [];

    this.message = new Message(config, this);
    this.api = new Api(config);
    this.user = new User(config);

    this.getHash = utils.getHash;
    this.getCredentials = utils.getCredentials;
    this.getSalt = utils.getSalt;

  }

  registerProfile(data){
    this.addEvent({
      eventType: 'PROFILE_REGISTER',
      data : {...data, publicKey: this.config.credentials.publicKey}
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
        ...document.toJSON(),
        documentId: document.getId(this.config.credentials.address)
      }
    })
  }

  registerDocumentBulk(document) {
    let registerBulk = _.findLast(this.events, e => e.eventType === 'DOCUMENT_REGISTER_BULK');

    if (!registerBulk || registerBulk.data.length > this.maxBulkEntries){
      registerBulk = {eventType : 'DOCUMENT_REGISTER_BULK', data: []};
      this.addEvent(registerBulk);
    }
    registerBulk.data.push({...document.toJSON(), documentId: document.getId(this.config.credentials.address)});
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
    return event;
  }

  registerPremiumUser(data, callback){
    this.api.registerPremiumUser(data, callback);
  }

  getRegistrationInfos(registration){
      return {
        hash: registration.state.documentHash,
        location: registration.state.locationHash,
        id: utils.getHash(`${this.config.credentials.address}:${registration.state.documentHash}`)
      }
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

  getTransactionCount(address, callback) {
    this.getProfiles({id: address}, (err, res) => {
      if (err && err.status == 404) return callback(null, {transactionCount: 0});
      if (err) return callback(err);
      return callback(null, {transactionCount: res.counts.transactions});
    });
  }

  getReceivers(params, callback) {
  this.api.get('receivers', params, callback);
  }

  getRegistrations(params, callback) {
    this.api.get('registrations', params, callback);
  }

  getValidation(id, verificationProfile, callback) {
    if (typeof verificationProfile === "function") {
      callback = verificationProfile;
    }
    this.api.get('verification', {id, verificationProfile}, callback);
  }

  on (event, fun) {
    this.api.on(event,fun)
  }

  buildEvent(events, callback) {
    this.getTransactionCount (this.config.credentials.address, (err, res) => {
      if (err) return callback(err);
      let nonce = res.transactionCount + 1;
      callback(null, {
        events,
        nonce,
        version: this.config.version,
        chainId: this.config.chainId,
        chain: this.config.chain,
        from: this.config.credentials.address
      })
    })
  }


  commitPremium(callback){
    let eventsToCommit = _.take(this.events, this.maxEvents);
    this.events = _.drop(this.events, this.maxEvents);

    if (this.events.length > 0)
      console.info(`Notice: Not all events are committed, your are only allowed to commit ${this.maxEvents} events at once.`);


    this.buildEvent(eventsToCommit, (err, builtEvents) => {
      if (err) {
        this.events = [...eventsToCommit, ...this.events];
        return callback(err);
      }

      this.api.getHashForEvents(builtEvents, (err, res) => {
          if (err) {
            this.events = [...eventsToCommit, ...this.events];
            return callback(err);
          }
          else {
            let { hashToRegister, hash } = res;
            let signature = utils.sign(hashToRegister, this.config.credentials.privateKey);

            let eventsInfo = this.listEvents(builtEvents, null, hash);


            this.api.submitPremium(builtEvents, this.config.credentials.address, hashToRegister, hash, signature, (err, res) => {
                if (err) {
                  this.events = [...eventsToCommit, ...this.events];
                  return callback(err);
                }
                return callback(null, {...res, ...eventsInfo});
            });
          }
      });
    });
  }

  commit(callback){
    let eventsToCommit = _.take(this.events, this.maxEvents);
    this.events = _.drop(this.events, this.maxEvents);

    if (this.events.length > 0)
      console.info(`Notice: Not all events are committed, your are only allowed to commit ${this.maxEvents} events at once.`);

    this.buildEvent(eventsToCommit, (err, builtEvents) => {
      if (err) {
        this.events = [...eventsToCommit, ...this.events];
        return callback(err);
      }

      this.api.getRawTransaction(builtEvents, (err, res) => {
        if (err) {
          this.events = [...eventsToCommit, ...this.events];
          return callback(err);
        }
        else {
          let { hash, rawTransaction, message } = res;
          let { transactionHash, signedTx } = utils.signTx(rawTransaction, this.config.credentials.privateKey);

          let eventsInfo = this.listEvents(builtEvents, transactionHash, hash);

          this.api.submit(builtEvents, signedTx, transactionHash, (err, res) => {
            if (err)
              this.events = [...eventsToCommit, ...this.events];
            callback(err,{...res, ...eventsInfo});
          });
        }
      });
    })
  }

  listEvents(builtEvents, txHash, dhtHash){
    let transactionId;
    txHash = txHash || undefined;
    if (txHash){
      txHash = txHash.toLowerCase();
      transactionId = this.getHash(`${txHash}:${dhtHash}`);
    }

    return {
      ...builtEvents,
      transactionHash: txHash,
      dhtHash: dhtHash,
      transactionId: transactionId,
      events: builtEvents.events.map((e, i) => {
        return {
          ...e,
          eventId: transactionId ? this.getHash(`${transactionId}:${i}`) : undefined
      }
    })
    }
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

  uploadFilePromise(buf) {
    return new Promise((resolve,reject) => {
      this.api.uploadFile(buf, (err, res) => {
        if (err) reject(err);
        else resolve(res);
      })
    })
  }

}

module.exports = Sproof;