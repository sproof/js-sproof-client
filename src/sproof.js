const utils = require ('sproof-utils');
const Receiver = require ('./receiver');
const Message = require ('./message');
const Api = require ('./api');
const User = require ('./user');
const Registration = require('./registration');

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

  registerProfile(data, publicKey){
    return this.addEvent({
      eventType: 'PROFILE_REGISTER',
      data : {...data, publicKey: publicKey || this.config.credentials.publicKey}
    });
    return data;
  }


  updateProfile(data){
    return this.addEvent({
      eventType: 'PROFILE_UPDATE',
      data
    });
  }

  confirmProfile(profileId, value){
    return this.addEvent({
      eventType: 'PROFILE_CONFIRM',
      data :{
        to: profileId,
        value
      }
    });
  }

  revokeProfile(reason){
    return this.addEvent({
      eventType: 'PROFILE_REVOKE',
      data :{
        reason
      }
    });
  }

  registerDocument(document) {
    return this.addEvent({
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

    return registerBulk;
  }

  revokeDocument(documentHash, reason) {
    return this.addEvent({
      eventType: 'DOCUMENT_REVOKE',
      data: {
        reason,
        documentHash
      }
    })
  }

  addDocumentReceiver(documentHash, receiverId){
    return this.addEvent({
      eventType: 'DOCUMENT_RECEIVER_ADD',
      data: {
        documentHash,
        receiverId
      }
    })
  }

  revokeDocumentReceiver(receiverId, reason) {
    return this.addEvent({
      eventType: 'DOCUMENT_RECEIVER_REVOKE',
      data: {
        receiverId,
        reason
      }
    })
  }

  prepareEvents(eventsToAdd){
    let allEvents = [...eventsToAdd];

    this.events = [];
    let hashes = [];

    allEvents.map(e => {
      let hash;
      switch(e.eventType){
        case "DOCUMENT_REGISTER":
          hash = this.getHash(e.data);

          if (!hashes.includes(hash))
            this.registerDocumentBulk(new Registration(e.data));

          break;
        case "DOCUMENT_REGISTER_BULK":
          e.data.map(r => {
            hash = this.getHash(r);
            if (!hashes.includes(hash))
              this.registerDocumentBulk(new Registration(r))
          });
          break;
        default:
          hash = this.getHash(e);
          if (!hashes.includes(hash))
            this.addEvent(e);
      }
      hashes.push(hash)
    })
    return this.events;
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
      verificationProfile = undefined;
    }

    let params = {id};

    if (verificationProfile)
      params['verificationProfile'] = verificationProfile;

    this.api.get('verification', params, callback);
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


  async prepareFirstRegistration(registrationData, address, encryptedMenemonic, passphrase, callback){

    let menemonic = utils.decryptAES(passphrase, encryptedMenemonic)

    if (menemonic.split(' ').length != 12)
      return callback('Wrong passphrase!');

    let eventsMain = [{eventType: 'PROFILE_REGISTER', data: registrationData}];
    let eventsTestnet = [{eventType: 'PROFILE_REGISTER', data: {...registrationData, name: registrationData.name + ' [test profile]'}}];
    let version = this.config.version;
    let nonce = 1;
    let chainIdMain = '1';
    let chainIdTest = '3';
    let chain = this.config.chain;
    let from = address;

    let mainnetTx = {
      events : eventsMain, version, nonce, chainId: chainIdMain, chain, from
    };

    let testnetTx = {
      events : eventsTestnet, version, nonce, chainId: chainIdTest, chain, from
    };

    let mainnetHash = {};
    let testnetHash = {};

    window.sp.config.credentials = {};


    mainnetHash = await this.api.getHashForEventsPromise(mainnetTx);
    testnetHash = await this.api.getHashForEventsPromise(testnetTx);

    let mainnetHashToRegister = mainnetHash.hashToRegister;
    let testnetHashToRegister = testnetHash.hashToRegister;

    let privateKey = utils.restoreCredentials(menemonic).privateKey;


    let signatureMainnet;
    let signatureTestnet;

    signatureMainnet = utils.sign(mainnetHashToRegister, privateKey);
    signatureTestnet = utils.sign(testnetHashToRegister, privateKey);

    callback(null,{
      mainnet: {
        eventContainer : mainnetTx,
        from: address,
        hashToRegister: mainnetHashToRegister,
        hash: mainnetHash.hash,
        signature: signatureMainnet
      },
      testnet: {
        eventContainer : testnetTx,
        from: address,
        hashToRegister: testnetHashToRegister,
        hash: testnetHash.hash,
        signature: signatureTestnet
      }
    });
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

  setEncryptedSproofCode(encryptedMnemonic, passphrase){
    try{
      let mnemonic = utils.decryptAES(passphrase, encryptedMnemonic);
      if (mnemonic.split(' ').length == 12) {
        let credentials = utils.restoreCredentials(mnemonic);
        this.config.credentials = {...this.config.credentials, ...credentials}
        return true;
      }
    }catch (err) {return false}
    return false;
  }

  decryptMnemonic(encryptedMnemonic, passphrase){
    try{
      let mnemonic = utils.decryptAES(passphrase, encryptedMnemonic);
      if (mnemonic.split(' ').length == 12) {
        return mnemonic
      }
    }catch (err) {return false}
    return false;
  }

  encryptMnemonic(mnemonic, passphrase) {
    return utils.encryptAES(passphrase, mnemonic);
  }

  removeSproofCode(){
    this.config.credentials.privateKey = undefined;
    this.config.credentials.mnemonic = undefined;

  }

  getWebAppPublicKey(){
    let ec =  utils.getEncryptedCredentials(this.config.credentials.sproofCode, 'not needed here');
    delete ec.encryptedMnemonic;
    return JSON.stringify(ec);
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
