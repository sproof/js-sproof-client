const axios = require('axios');
const io = require('socket.io-client');

class API {
  constructor(config = {}){
    this.config = config;
    this.io = io(config.uri);
    this.versionpath = 'api/v1/'

  }

  createCredentials (credentials) {
    return {address: credentials.address}
  }

  on (event, fun) {
    this.io.on(event, fun);
  }

  post(url, data, callback) {
    url =  this.versionpath + url;
    url = this.config.uri ? `${this.config.uri}${url}` : url;

    let credentials = this.createCredentials(this.config.credentials);
    axios.post(url, {...data, credentials}).then(res => {
      if (res.data.error) return callback(res.data.error);
      return callback(null, res.data.result);
    }).catch(err => {
      callback(err)
    });
  }

  uploadFile(buf, callback){
    this.post('storage/upload', {file: buf}, callback);
  }

  get(url, params, callback){
    url =  this.versionpath + url;
    url = this.config.uri ? `${this.config.uri}${url}` : url;
    url = `${url}${params.id ? `/${params.id}` : '' }`;
    delete params.id;
    let credentials = this.createCredentials(this.config.credentials);
    axios.get(url, {params, credentials }).then(res => {
      if (res.data.error) return callback(res.data.error);
      callback(null, res.data.result);
    }).catch(err => {
      callback(err);
    })
  }

  getHash (data, callback) {
    this.post('storage/hash', {data}, callback);
  }

  getStatus(callback) {
    this.get('storage/status', callback);
  }

  getRawTransaction (events, callback) {
    this.post('storage/transaction', {events, address: this.config.credentials.address }, callback);
  }

  submit (events, signedTx, transactionHash, callback) {
    this.post('storage/submit', {events, signedTx, transactionHash}, callback);
  }

  submitPremium(events, from,  hash, signature, callback) {
    this.post('storage/premium/submit', {events, hash, from, signature}, callback);
  }
}

module.exports = API;